import Service from "@ember/service";
import {inject as service} from "@ember/service";
import {tracked} from "@glimmer/tracking";
import {action} from "@ember/object";
import {openDB} from "@fireproof/core";
import {getStore} from "@netlify/blobs";
import {schedule, later, cancel} from "@ember/runloop";
import {getOwner} from "@ember/application";

// Configuration constants - exported for use elsewhere
export const RECONNECT_INTERVAL = 5000; // ms to wait before reconnecting after offline
export const AUTO_SYNC_INTERVAL = 60000; // Auto-sync every minute when online
export const SYNC_DEBOUNCE = 2000; // Debounce time for rapid sync requests
export const CHECK_SERVICE_INTERVAL = 100; // ms to wait between service initialization checks

// Document IDs for Fireproof settings
export const SETTINGS_DOC_ID = "sync-settings";

// Setting keys for localStorage (legacy)
export const STORAGE_KEY_LAST_SYNCED = "lastSyncedAt";
export const STORAGE_KEY_AUTO_SYNC = "autoSyncEnabled";

// Default values
export const DEFAULT_USER_NAME = "storyplanner-anonymous";
export const DEFAULT_SITE_ID = "local-dev";
export const BLOB_STORE_NAME = "storyplanner-blobs";

// Translation keys
const TRANSLATION_KEY_SYNC_ERROR = "sync.error.sync";
const TRANSLATION_KEY_LOGIN_ERROR = "sync.error.login";
const TRANSLATION_KEY_LOGOUT_ERROR = "sync.error.logout";
const TRANSLATION_KEY_SYNC_ACTION = "sync.action.sync";
const TRANSLATION_KEY_SYNCING_ACTION = "sync.action.syncing";

// Error messages
const ERROR_BLOB_STORE_UNAVAILABLE = "Blob store not available";
const ERROR_INIT_FAILED = "Failed to initialize sync services";

// Event names
const EVENT_ONLINE = "online";
const EVENT_OFFLINE = "offline";
const EVENT_AUTH_SUCCESS = "authenticationSucceeded";
const EVENT_AUTH_INVALIDATED = "invalidationSucceeded";

// For backward compatibility
let serviceInstance = null;

export async function getNetlifyContext() {
	// If we already have the service instance, return its context directly
	if (serviceInstance?.siteID) {
		return {
			netlifyIdentity: window.netlifyIdentity,
			blobStore: serviceInstance.blobStore,
			name: serviceInstance.user?.email || DEFAULT_USER_NAME,
			siteID: serviceInstance.siteID
		};
	}

	// Otherwise, get the service from the container (preferred approach)
	const module = await import("../app");
	const owner = getOwner(module.default.resolveRegistration("route:application"));
	const syncService = owner.lookup("service:data-sync");

	return {
		netlifyIdentity: window.netlifyIdentity,
		blobStore: syncService.blobStore,
		name: syncService.user?.email || DEFAULT_USER_NAME,
		siteID: syncService.siteID
	};
}

function checkForService(resolve) {
	if (serviceInstance && serviceInstance.siteID) {
		resolve({
			netlifyIdentity: window.netlifyIdentity,
			blobStore: serviceInstance.blobStore,
			name: serviceInstance.user?.email || DEFAULT_USER_NAME,
			siteID: serviceInstance.siteID
		});
	} else {
		setTimeout(() => checkForService(resolve), CHECK_SERVICE_INTERVAL);
	}
}

export default class DataSyncService extends Service {
	@service store;
	@service intl;
	@service router;
	@service session;

	// Connection state
	@tracked isOnline = navigator.onLine;
	@tracked isSyncing = false;
	@tracked lastSyncedAt = null;
	@tracked syncError = null;
	@tracked autoSyncEnabled = true;

	// Internals
	db = null;
	blobStore = null;
	siteID = null;
	syncSubscription = null;
	reconnectTimer = null;
	autoSyncTimer = null;
	syncDebounceTimer = null;

	// Track initialization state
	@tracked isInitialized = false;
	databaseInitPromise = null;

	constructor() {
		super(...arguments);

		// Set the global instance for the compatibility layer
		serviceInstance = this;

		// Initialize on next run loop - returns a promise that resolves when initialization is complete
		this.databaseInitPromise = schedule("afterRender", this, async () => {
			await this._initialize();
			this.isInitialized = true;
			return this;
		});
	}

	willDestroy() {
		super.willDestroy();
		this._removeEventListeners();

		// Clear all timers
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
		}

		if (this.autoSyncTimer) {
			cancel(this.autoSyncTimer);
		}

		if (this.syncDebounceTimer) {
			cancel(this.syncDebounceTimer);
		}

		if (this.syncSubscription) {
			this.syncSubscription.unsubscribe();
		}
	}

	// ===== Public API =====

	get user() {
		let userObject = null;

		if (this.session.isAuthenticated) {
			userObject = this.session.data.authenticated.user;
		}

		return userObject;
	}

	get hasUser() {
		return this.session.isAuthenticated;
	}

	get error() {
		return this.syncError;
	}

	get disableSyncButton() {
		return !this.isOnline || !this.hasUser || this.isSyncing;
	}

	get syncButtonText() {
		let buttonText = TRANSLATION_KEY_SYNC_ACTION;

		if (this.isSyncing) {
			buttonText = TRANSLATION_KEY_SYNCING_ACTION;
		}

		return buttonText;
	}

	@action async toggleAutoSync() {
		this.autoSyncEnabled = !this.autoSyncEnabled;

		const updateSuccess = await this._updateSyncSettings({
			autoSyncEnabled: this.autoSyncEnabled
		});

		if (this.autoSyncEnabled) {
			this._scheduleNextAutoSync();
		} else if (this.autoSyncTimer) {
			cancel(this.autoSyncTimer);
			this.autoSyncTimer = null;
		}

		return updateSuccess;
	}

	@action async login() {
		try {
			await this.session.authenticate("authenticator:netlify");
		} catch (error) {
			this.syncError = this.intl.t(TRANSLATION_KEY_LOGIN_ERROR);
			console.error("Login error:", error);
		}
	}

	@action async logout() {
		try {
			await this.session.invalidate();
		} catch (error) {
			this.syncError = this.intl.t(TRANSLATION_KEY_LOGOUT_ERROR);
			console.error("Logout error:", error);
		}
	}

	@action async sync() {
		let syncPerformed = false;

		// Only proceed if we're not already syncing and sync button is enabled
		if (!this.syncDebounceTimer && !this.disableSyncButton) {
			this.isSyncing = true;
			this.syncError = null;

			// Set debounce timer
			this.syncDebounceTimer = later(() => {
				this.syncDebounceTimer = null;
			}, SYNC_DEBOUNCE);

			try {
				// Ensure database is initialized
				await this._ensureInitialized();

				// Trigger a sync
				await this.db.info();

				// Update last sync time
				this.lastSyncedAt = new Date();

				// Save to Fireproof
				await this._updateSyncSettings({
					lastSyncedAt: this.lastSyncedAt.toISOString()
				});

				// Clear reconnect timer if active
				if (this.reconnectTimer) {
					clearTimeout(this.reconnectTimer);
					this.reconnectTimer = null;
				}

				// Schedule next auto-sync if enabled
				if (this.autoSyncEnabled) {
					this._scheduleNextAutoSync();
				}

				syncPerformed = true;
			} catch (error) {
				this.syncError = this.intl.t(TRANSLATION_KEY_SYNC_ERROR);
				console.error("Sync error:", error);

				// Retry connection after a delay
				if (this.isOnline) {
					this.reconnectTimer = setTimeout(() => {
						this.sync();
					}, RECONNECT_INTERVAL);
				}
			} finally {
				this.isSyncing = false;
			}
		}

		return syncPerformed;
	}

	/**
	 * Update settings document in Fireproof
	 * @param {Object} updates - Settings to update
	 * @returns {Promise<boolean>} - Whether the update was successful
	 */
	async _updateSyncSettings(updates) {
		let updateSuccess = false;

		// Ensure database is initialized
		await this._ensureInitialized();

		try {
			// Get current settings or create new document
			let settingsDoc;
			try {
				settingsDoc = await this.db.get(SETTINGS_DOC_ID);
			} catch (error) {
				// Document doesn't exist yet
				settingsDoc = {
					_id: SETTINGS_DOC_ID,
					type: "settings",
					autoSyncEnabled: this.autoSyncEnabled
				};
			}

			// Apply updates
			Object.assign(settingsDoc, updates);

			// Save to Fireproof
			await this.db.put(settingsDoc);
			updateSuccess = true;
		} catch (error) {
			console.error("Error saving settings to Fireproof:", error);
			throw error;
		}

		return updateSuccess;
	}

	// Blob storage methods
	async storeBlob(key, data) {
		let blobStored = null;
		let blobInitialized = false;

		if (!this.blobStore) {
			blobInitialized = await this._initializeBlobStore();
		} else {
			blobInitialized = true;
		}

		if (blobInitialized && this.blobStore) {
			try {
				blobStored = await this.blobStore.set(key, data);
			} catch (error) {
				console.error(`Error storing blob with key: ${key}`, error);
				throw error;
			}
		} else {
			throw new Error(ERROR_BLOB_STORE_UNAVAILABLE);
		}

		return blobStored;
	}

	async getBlob(key) {
		let blob = null;
		let blobInitialized = false;

		if (!this.blobStore) {
			blobInitialized = await this._initializeBlobStore();
		} else {
			blobInitialized = true;
		}

		if (blobInitialized && this.blobStore) {
			try {
				blob = await this.blobStore.get(key);
			} catch (error) {
				console.error(`Error retrieving blob with key: ${key}`, error);
			}
		} else {
			throw new Error(ERROR_BLOB_STORE_UNAVAILABLE);
		}

		return blob;
	}

	// ===== Private Methods =====

	async _initialize() {
		try {
			// Initialize services
			await this._initializeBlobStore();

			// Set up session monitoring
			this.session.on(EVENT_AUTH_SUCCESS, this._handleAuthenticationSuccess);
			this.session.on(EVENT_AUTH_INVALIDATED, this._handleInvalidationSuccess);

			// Always initialize database, regardless of authentication
			await this._initializeDatabase();

			// Set up event listeners
			this._setupEventListeners();

			// Load state (last sync time and settings)
			await this._loadStateFromStorage();

			if (this.autoSyncEnabled && this.isOnline && this.hasUser) {
				// Schedule recurring syncs
				this._scheduleNextAutoSync();

				// Initial sync on startup if authenticated
				if (this.hasUser) {
					await this.sync();
				}
			}
		} catch (error) {
			this.syncError = ERROR_INIT_FAILED;
			console.error("Error initializing data sync:", error);
			throw error;
		}
	}

	/**
	 * Ensures the database is initialized before performing operations
	 * @returns {Promise<void>}
	 */
	async _ensureInitialized() {
		if (!this.isInitialized && this.databaseInitPromise) {
			await this.databaseInitPromise;
		}

		if (!this.db) {
			throw new Error("Database failed to initialize properly");
		}
	}

	async _initializeBlobStore() {
		let initSuccess = false;

		try {
			// Get site ID
			this.siteID = process.env.NETLIFY_SITE_ID || DEFAULT_SITE_ID;

			// Create blob store if not already initialized
			if (!this.blobStore) {
				this.blobStore = getStore({
					siteID: this.siteID,
					name: BLOB_STORE_NAME
				});
			}

			initSuccess = true;
		} catch (error) {
			console.error("Failed to initialize blob store:", error);
		}

		return initSuccess;
	}

	async _initializeDatabase() {
		let initSuccess = false;

		try {
			// Use user email or fallback name for database
			const dbName = this.user?.email || DEFAULT_USER_NAME;
			this.db = await openDB(dbName);

			// Setup change listeners for database
			this._setupChangeListener();

			initSuccess = true;
		} catch (error) {
			console.error("Error initializing database:", error);
			throw new Error(`Failed to initialize Fireproof database: ${error.message}`);
		}

		return initSuccess;
	}

	_setupEventListeners() {
		// Online/offline events
		window.addEventListener(EVENT_ONLINE, this._handleOnline);
		window.addEventListener(EVENT_OFFLINE, this._handleOffline);
	}

	_removeEventListeners() {
		// Online/offline events
		window.removeEventListener(EVENT_ONLINE, this._handleOnline);
		window.removeEventListener(EVENT_OFFLINE, this._handleOffline);

		// Session events
		this.session.off(EVENT_AUTH_SUCCESS, this._handleAuthenticationSuccess);
		this.session.off(EVENT_AUTH_INVALIDATED, this._handleInvalidationSuccess);
	}

	_setupChangeListener() {
		let setupSuccessful = false;

		if (this.db) {
			// Unsubscribe from previous subscription if exists
			if (this.syncSubscription) {
				this.syncSubscription.unsubscribe();
			}

			// Subscribe to changes
			this.syncSubscription = this.db.changes().subscribe({
				next: change => this._handleDatabaseChange(change),
				error: error => {
					this.syncError = error.message;
					console.error("Error in database change subscription:", error);
				}
			});

			setupSuccessful = true;
		}

		return setupSuccessful;
	}

	async _loadStateFromStorage() {
		// Load settings from Fireproof database
		let settingsLoaded = false;

		try {
			const settingsDoc = await this.db.get(SETTINGS_DOC_ID);
			if (settingsDoc) {
				// Load auto-sync setting
				if (typeof settingsDoc.autoSyncEnabled === "boolean") {
					this.autoSyncEnabled = settingsDoc.autoSyncEnabled;
					settingsLoaded = true;
				}

				// Load last sync time if available
				if (settingsDoc.lastSyncedAt) {
					try {
						this.lastSyncedAt = new Date(settingsDoc.lastSyncedAt);
					} catch (error) {
						console.error("Error parsing lastSyncedAt from Fireproof:", error);
					}
				}
			}
		} catch (error) {
			// Settings document doesn't exist yet - use defaults
			console.log("No settings document found in Fireproof, creating with defaults");

			// Save default settings
			try {
				await this._updateSyncSettings({
					autoSyncEnabled: this.autoSyncEnabled,
					lastSyncedAt: this.lastSyncedAt?.toISOString()
				});
				settingsLoaded = true;
			} catch (settingError) {
				console.error("Failed to save default settings:", settingError);
			}
		}

		return settingsLoaded;
	}

	_scheduleNextAutoSync() {
		// Cancel any existing timer
		if (this.autoSyncTimer) {
			cancel(this.autoSyncTimer);
		}

		// Schedule next sync if enabled, online and authenticated
		if (this.autoSyncEnabled && this.isOnline && this.hasUser) {
			this.autoSyncTimer = later(this, this.sync, AUTO_SYNC_INTERVAL);
		}
	}

	// ===== Event Handlers =====

	@action _handleOnline() {
		this.isOnline = true;
		if (this.hasUser) {
			// Automatically sync when we come back online
			this.sync();
		}
	}

	@action _handleOffline() {
		this.isOnline = false;

		// Clear timers when offline
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
		}

		if (this.autoSyncTimer) {
			cancel(this.autoSyncTimer);
		}
	}

	@action
	_handleAuthenticationSuccess() {
		this.syncError = null;

		// Re-initialize database with new user
		schedule("afterRender", this, async () => {
			await this._initializeDatabase();
			this.sync();
		});
	}

	@action _handleInvalidationSuccess() {
		// Clean up database when user logs out
		if (this.syncSubscription) {
			this.syncSubscription.unsubscribe();
			this.syncSubscription = null;
		}

		if (this.autoSyncTimer) {
			cancel(this.autoSyncTimer);
			this.autoSyncTimer = null;
		}

		this.db = null;
	}

	async _handleDatabaseChange(change) {
		const {doc, id} = change;
		let modifiedDatabase = false;

		if (!doc) {
			// Document was deleted
			modifiedDatabase = await this._handleDocumentDeletion(id);
		} else {
			// Handle document change
			modifiedDatabase = await this._handleDocumentChange(doc);
		}

		return modifiedDatabase;
	}

	async _handleDocumentChange(document) {
		let success = false;

		if (document.type) {
			const modelName = document.type;
			const id = document._id;

			try {
				// Check if the record exists in the store
				const recordInStore = this.store.peekRecord(modelName, id);

				if (recordInStore) {
					// Update existing record
					this._updateRecordFromDoc(recordInStore, document);
				} else {
					// Create new record
					this._createRecordFromDoc(modelName, document);
				}

				success = true;
			} catch (error) {
				console.error("Error handling document change:", error);
			}
		}

		return success;
	}

	_updateRecordFromDoc(record, doc) {
		// Extract attributes
		const attributes = {...doc};
		delete attributes._id;
		delete attributes._rev;
		delete attributes.type;
		delete attributes.relationships;

		// Update attributes
		Object.keys(attributes).forEach(key => {
			if (record[key] !== attributes[key]) {
				record[key] = attributes[key];
			}
		});
	}

	_createRecordFromDoc(modelName, doc) {
		// Check if the ID already exists to avoid duplicates
		let record = null;

		if (!this.store.peekRecord(modelName, doc._id)) {
			// Extract attributes
			const attributes = {...doc};
			delete attributes._id;
			delete attributes._rev;
			delete attributes.type;
			delete attributes.relationships;

			// Create record
			record = this.store.createRecord(modelName, {
				id: doc._id,
				...attributes
			});
		}

		return record;
	}

	async _handleDocumentDeletion(id) {
		let recordDeleted = false;

		// Find any record with matching id in store
		const record = Array.from(this.store.peekAll()).find(record => record.id === id && !record.isDeleted);

		if (record) {
			record.deleteRecord();
			recordDeleted = true;
		}

		return recordDeleted;
	}
}
