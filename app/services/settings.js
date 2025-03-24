import Service from "@ember/service";
import {inject as service} from "@ember/service";
import {tracked} from "@glimmer/tracking";

export default class SettingsService extends Service {
	@service store;
	@tracked settings;
	@tracked theme;

	constructor() {
		super(...arguments);
		this._loadSettings();
	}

	/**
	 * Load settings and theme data from the store
	 * Creates default records if they don't exist
	 */
	async _loadSettings() {
		this.settings = await this._getOrCreateSettings();
		this.theme = await this._getOrCreateTheme();
	}

	/**
	 * Helper to get or create settings record
	 * @returns {Promise<DS.Model>} The settings record
	 */
	async _getOrCreateSettings() {
		let settingsRecord = null;

		try {
			settingsRecord = await this.store.findRecord("settings", "settings");
		} catch (error) {
			console.log("Creating new settings record", error);
			settingsRecord = this.store.createRecord("settings", {
				id: "settings",
				maxWordCount: 1000
			});
			await settingsRecord.save();
		}

		return settingsRecord;
	}

	/**
	 * Helper to get or create theme record
	 * @returns {Promise<DS.Model>} The theme record
	 */
	async _getOrCreateTheme() {
		let themeRecord = null;

		try {
			themeRecord = await this.store.findRecord("theme", "theme");
		} catch (error) {
			console.log("Creating new theme record", error);

			const themeModule = await import("../models/theme");
			const initialState = themeModule.default.initializeFromCSS();
			const themeData = {id: "theme", ...initialState};

			themeRecord = this.store.createRecord("theme", themeData);
			await themeRecord.save();
		}

		return themeRecord;
	}
}
