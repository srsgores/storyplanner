import JSONAPIAdapter from "@ember-data/adapter/json-api";
import {inject as service} from "@ember/service";
import {schedule} from "@ember/runloop";
import {tracked} from "@glimmer/tracking";

export default class FireproofAdapter extends JSONAPIAdapter {
	@service("data-sync") dataSync;
	@tracked db = null;

	constructor() {
		super(...arguments);

		// Initialize database on next runloop
		schedule("afterRender", this, async function () {
			await this._initDatabase();
		});
	}

	async _initDatabase() {
		try {
			// Use the database from data-sync service
			this.db = this.dataSync.db;

			// If db not yet available in the service, wait for it
			if (!this.db) {
				await new Promise(resolve => {
					const checkDb = () => {
						if (this.dataSync.db) {
							this.db = this.dataSync.db;
							resolve();
						} else {
							setTimeout(checkDb, 100);
						}
					};
					checkDb();
				});
			}
		} catch (error) {
			console.error("Error initializing Fireproof adapter:", error);
		}
	}

	async _ensureDatabase() {
		if (!this.db) {
			await this._initDatabase();
		}
		return this.db;
	}

	generateIdForRecord() {
		return new Date().getTime().toString();
	}

	async findRecord(store, type, id) {
		await this._ensureDatabase();

		try {
			const doc = await this.db.get(id);
			return this._docToJsonApi(doc, type.modelName);
		} catch (error) {
			console.error(`Error finding record ${type.modelName}:${id}`, error);
			throw error;
		}
	}

	async findAll(store, type) {
		await this._ensureDatabase();

		try {
			const docs = await this.db.allDocs();
			return {
				data: docs.rows.filter(row => row.doc && row.doc.type === type.modelName).map(row => this._docToJsonApiRecord(row.doc, type.modelName))
			};
		} catch (error) {
			console.error(`Error finding all records for ${type.modelName}`, error);
			throw error;
		}
	}

	async createRecord(store, type, snapshot) {
		await this._ensureDatabase();

		const data = this.serialize(snapshot);
		const doc = {
			_id: snapshot.id,
			...data.attributes,
			type: type.modelName,
			relationships: {}
		};

		// Handle relationships
		Object.keys(data.relationships || {}).forEach(key => {
			const relationshipData = data.relationships[key].data;
			if (Array.isArray(relationshipData)) {
				doc.relationships[key] = relationshipData.map(item => item.id);
			} else if (relationshipData) {
				doc.relationships[key] = relationshipData.id;
			}
		});

		try {
			await this.db.put(doc);
			return this._docToJsonApi(doc, type.modelName);
		} catch (error) {
			console.error(`Error creating record for ${type.modelName}`, error);
			throw error;
		}
	}

	async updateRecord(store, type, snapshot) {
		await this._ensureDatabase();

		const id = snapshot.id;
		try {
			const doc = await this.db.get(id);
			const data = this.serialize(snapshot);

			// Update attributes
			const updatedDoc = {
				...doc,
				...data.attributes
			};

			// Update relationships
			updatedDoc.relationships = updatedDoc.relationships || {};
			Object.keys(data.relationships || {}).forEach(key => {
				const relationshipData = data.relationships[key].data;
				if (Array.isArray(relationshipData)) {
					updatedDoc.relationships[key] = relationshipData.map(item => item.id);
				} else if (relationshipData) {
					updatedDoc.relationships[key] = relationshipData.id;
				}
			});

			await this.db.put(updatedDoc);
			return this._docToJsonApi(updatedDoc, type.modelName);
		} catch (error) {
			console.error(`Error updating record ${type.modelName}:${id}`, error);
			throw error;
		}
	}

	async deleteRecord(store, type, snapshot) {
		await this._ensureDatabase();

		const id = snapshot.id;
		try {
			const doc = await this.db.get(id);
			await this.db.remove(doc);
			return {data: null};
		} catch (error) {
			console.error(`Error deleting record ${type.modelName}:${id}`, error);
			throw error;
		}
	}

	_docToJsonApi(doc, modelName) {
		return {
			data: this._docToJsonApiRecord(doc, modelName)
		};
	}

	_docToJsonApiRecord(doc, modelName) {
		const {_id, _rev, type, relationships, ...attributes} = doc;

		const jsonApiDoc = {
			id: _id,
			type: modelName,
			attributes
		};

		// Convert relationships to JSON API format
		if (relationships) {
			jsonApiDoc.relationships = {};

			Object.keys(relationships).forEach(key => {
				const relValue = relationships[key];

				if (Array.isArray(relValue)) {
					jsonApiDoc.relationships[key] = {
						data: relValue.map(id => ({
							id,
							type: key.slice(0, -1) // Remove 's' from plural relationship name
						}))
					};
				} else if (relValue) {
					jsonApiDoc.relationships[key] = {
						data: {
							id: relValue,
							type: key
						}
					};
				}
			});
		}

		return jsonApiDoc;
	}
}
