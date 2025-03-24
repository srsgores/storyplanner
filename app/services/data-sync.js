import Service from "@ember/service";
import {inject as service} from "@ember/service";
import {tracked} from "@glimmer/tracking";
import {action} from "@ember/object";
import {openDB} from "@fireproof/core";
import {getStore} from "@netlify/blobs";
import {schedule, later, cancel} from "@ember/runloop";

// Configuration constants - exported for use elsewhere
export const RECONNECT_INTERVAL = 5000; // ms to wait before reconnecting after offline
export const AUTO_SYNC_INTERVAL = 60000; // Auto-sync every minute when online
export const SYNC_DEBOUNCE = 2000; // Debounce time for rapid sync requests

// Singleton for Netlify context - preserved for backward compatibility
let netlifyContextPromise = null;
let serviceInstance = null;

export function getNetlifyContext() {
	if (!netlifyContextPromise) {
		netlifyContextPromise = new Promise(async (resolve) => {
			// Wait for service to initialize
			const checkService = () => {
				if (serviceInstance && serviceInstance.siteID) {
					resolve({
						netlifyIdentity: window.netlifyIdentity,
						blobStore: serviceInstance.blobStore,
						name: serviceInstance.user?.email || "storyplanner-anonymous",
						siteID: serviceInstance.siteID
					});
				} else {
					setTimeout(checkService, 100);
				}
			};

			checkService();
		});
	}

	return netlifyContextPromise;
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

	constructor() {
		super(...arguments);

		// Set the global instance for the compatibility layer
		serviceInstance = this;

		// Initialize on next run loop
		schedule("afterRender", this, this._initialize);
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
		if (this.session.isAuthenticated) {
			return this.session.data.authenticated.user;
		}
		return null;
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
		if (this.isSyncing) {
			return "sync.action.syncing";
		}
		return "sync.action.sync";
	}

	@action
	toggleAutoSync() {
		this.autoSyncEnabled = !this.autoSyncEnabled;
		localStorage.setItem("autoSyncEnabled", String(this.autoSyncEnabled));

		if (this.autoSyncEnabled) {
			this._scheduleNextAutoSync();
		} else if (this.autoSyncTimer) {
			cancel(this.autoSyncTimer);
			this.autoSyncTimer = null;
		}
	}

	@action
	async login() {
		try {
			await this.session.authenticate("authenticator:netlify");
		} catch (error) {
			this.syncError = this.intl.t("sync.error.login");
			console.error("Login error:", error);
		}
	}

	@action
	async logout() {
		try {
			await this.session.invalidate();
		} catch (error) {
			this.syncError = this.intl.t("sync.error.logout");
			console.error("Logout error:", error);
		}
	}

	@action
	async sync() {
		// Debounce rapid sync requests
		if (this.syncDebounceTimer) {
			return;
		}

		if (this.disableSyncButton) {
			return;
		}

		this.isSyncing = true;
		this.syncError = null;

		// Set debounce timer
		this.syncDebounceTimer = later(() => {
			this.syncDebounceTimer = null;
		}, SYNC_DEBOUNCE);

		try {
			// Ensure database is initialized
			if (!this.db) {
				await this._initializeDatabase();
			}

			// Trigger a sync
			await this.db.info();

			this.lastSyncedAt = new Date();
			localStorage.setItem("lastSyncedAt", this.lastSyncedAt.toISOString());

			// Clear reconnect timer if active
			if (this.reconnectTimer) {
				clearTimeout(this.reconnectTimer);
				this.reconnectTimer = null;
			}

			// Schedule next auto-sync if enabled
			if (this.autoSyncEnabled) {
				this._scheduleNextAutoSync();
			}
		} catch (error) {
			this.syncError = this.intl.t("sync.error.sync");
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

	// Blob storage methods
	async storeBlob(key, data) {
		if (!this.blobStore) {
			await this._initializeBlobStore();
		}

		if (!this.blobStore) {
			throw new Error("Blob store not available");
		}

		try {
			return await this.blobStore.set(key, data);
		} catch (error) {
			console.error(`Error storing blob with key: ${key}`, error);
			throw error;
		}
	}

	async getBlob(key) {
		if (!this.blobStore) {
			await this._initializeBlobStore();
		}

		if (!this.blobStore) {
			throw new Error("Blob store not available");
		}

		try {
			return await this.blobStore.get(key);
		} catch (error) {
			console.error(`Error retrieving blob with key: ${key}`, error);
			return null;
		}
	}

	// ===== Private Methods =====

	async _initialize() {
		try {
			// Initialize services
			await this._initializeBlobStore();

			// Set up session monitoring
			this.session.on("authenticationSucceeded", this._handleAuthenticationSuccess);
			this.session.on("invalidationSucceeded", this._handleInvalidationSuccess);

			// Initialize database if authenticated
			if (this.session.isAuthenticated) {
				await this._initializeDatabase();
			}

			// Set up event listeners
			this._setupEventListeners();
			this._loadStateFromLocalStorage();

			// Schedule auto-sync if enabled
			const savedAutoSyncEnabled = localStorage.getItem("autoSyncEnabled");
			this.autoSyncEnabled = savedAutoSyncEnabled !== "false";

			if (this.autoSyncEnabled && this.isOnline && this.hasUser) {
				// Initial sync on startup
				schedule("afterRender", this, () => this.sync());

				// Schedule recurring syncs
				this._scheduleNextAutoSync();
			}
		} catch (error) {
			this.syncError = "Failed to initialize sync services";
			console.error("Error initializing data sync:", error);
		}
	}

	_scheduleNextAutoSync() {
		// Cancel any existing timer
		if (this.autoSyncTimer) {
			cancel(this.autoSyncTimer);
		}

		// Schedule next sync if enabled, online and authenticated
		if (this.autoSyncEnabled && this.isOnline && this.hasUser) {
			this.autoSyncTimer = later(
				this,
				function () {
					this.sync();
				},
				AUTO_SYNC_INTERVAL
			);
		}
	}

	async _initializeBlobStore() {
		try {
			// Get site ID
			this.siteID = process.env.NETLIFY_SITE_ID || "local-dev";

			// Create blob store if not already initialized
			if (!this.blobStore) {
				this.blobStore = getStore({
					siteID: this.siteID,
					name: "storyplanner-blobs"
				});
			}

			return true;
		} catch (error) {
			console.error("Failed to initialize blob store:", error);
			return false;
		}
	}

	async _initializeDatabase() {
		try {
			// Use user email or fallback name for database
			const dbName = this.user?.email || "storyplanner-anonymous";
			this.db = await openDB(dbName);

			// Setup change listeners for database
			this._setupChangeListener();

			return true;
		} catch (error) {
			console.error("Error initializing database:", error);
			return false;
		}
	}

	_setupEventListeners() {
		// Online/offline events
		window.addEventListener("online", this._handleOnline);
		window.addEventListener("offline", this._handleOffline);
	}

	_removeEventListeners() {
		// Online/offline events
		window.removeEventListener("online", this._handleOnline);
		window.removeEventListener("offline", this._handleOffline);

		// Session events
		this.session.off("authenticationSucceeded", this._handleAuthenticationSuccess);
		this.session.off("invalidationSucceeded", this._handleInvalidationSuccess);
	}

	_setupChangeListener() {
		if (!this.db) return;

		// Unsubscribe from previous subscription if exists
		if (this.syncSubscription) {
			this.syncSubscription.unsubscribe();
		}

		// Subscribe to changes
		this.syncSubscription = this.db.changes().subscribe({
			next: (change) => this._handleDatabaseChange(change),
			error: (error) => {
				this.syncError = error.message;
				console.error("Error in database change subscription:", error);
			}
		});
	}

	_loadStateFromLocalStorage() {
		// Check for last sync time
		const lastSyncedAt = localStorage.getItem("lastSyncedAt");
		if (lastSyncedAt) {
			try {
				this.lastSyncedAt = new Date(lastSyncedAt);
			} catch (error) {
				console.error("Error parsing lastSyncedAt:", error);
				localStorage.removeItem("lastSyncedAt");
			}
		}
	}

	// ===== Event Handlers =====

	@action
	_handleOnline = () => {
		this.isOnline = true;
		if (this.hasUser) {
			// Automatically sync when we come back online
			this.sync();
		}
	};

	@action
	_handleOffline = () => {
		this.isOnline = false;

		// Clear timers when offline
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
		}

		if (this.autoSyncTimer) {
			cancel(this.autoSyncTimer);
		}
	};

	@action
	_handleAuthenticationSuccess = () => {
		this.syncError = null;

		// Re-initialize database with new user
		schedule("afterRender", this, async () => {
			await this._initializeDatabase();
			this.sync();
		});
	};

	@action
	_handleInvalidationSuccess = () => {
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
	};

	async _handleDatabaseChange(change) {
		const {doc, id} = change;

		if (!doc) {
			// Document was deleted
			await this._handleDocumentDeletion(id);
			return;
		}

		// Handle document change
		await this._handleDocumentChange(doc);
	}

	async _handleDocumentChange(doc) {
		if (!doc.type) return;

		const modelName = doc.type;
		const id = doc._id;

		try {
			// Check if the record exists in the store
			const recordInStore = this.store.peekRecord(modelName, id);

			if (recordInStore) {
				// Update existing record
				this._updateRecordFromDoc(recordInStore, doc);
			} else {
				// Create new record
				this._createRecordFromDoc(modelName, doc);
			}
		} catch (error) {
			console.error("Error handling document change:", error);
		}
	}

	_updateRecordFromDoc(record, doc) {
		// Extract attributes
		const attributes = {...doc};
		delete attributes._id;
		delete attributes._rev;
		delete attributes.type;
		delete attributes.relationships;

		// Update attributes
		Object.keys(attributes).forEach((key) => {
			if (record[key] !== attributes[key]) {
				record[key] = attributes[key];
			}
		});
	}

	_createRecordFromDoc(modelName, doc) {
		// Check if the ID already exists to avoid duplicates
		if (this.store.peekRecord(modelName, doc._id)) {
			return null;
		}

		// Extract attributes
		const attributes = {...doc};
		delete attributes._id;
		delete attributes._rev;
		delete attributes.type;
		delete attributes.relationships;

		// Create record
		const record = this.store.createRecord(modelName, {
			id: doc._id,
			...attributes
		});

		return record;
	}

	async _handleDocumentDeletion(id) {
		// Find any record with matching id in store
		const record = Array.from(this.store.peekAll()).find((record) => record.id === id && !record.isDeleted);

		if (record) {
			record.deleteRecord();
		}
	}
}
