import Service from "@ember/service";
import {isEmpty} from "@ember/utils";
import {assert} from "@ember/debug";
import ENV from "ember-get-config";
import fetch from "fetch";
import EmberError from "@ember/error";
import {inject as service} from "@ember/service";
import {tracked} from "@glimmer/tracking";

export const TEXT_MISSING_ERROR_MESSAGE = "text must not be empty";

export const AUTOCOMPLETE_API_URL = "https://api.openai.com/v1/completions";

export default class AutocompleteService extends Service {
	@service store;
	@tracked settings;

	autocompleteURL = AUTOCOMPLETE_API_URL;
	config = {
		model: ENV.OPENAI.MODEL,
		n: 1,
		stop: ["\n"]
	};

	constructor() {
		super(...arguments);
		this._loadSettings();
	}

	/**
	 * Load autocomplete settings from the store
	 */
	async _loadSettings() {
		this.settings = await this._getOrCreateSettings();
	}

	/**
	 * Helper to get or create autocomplete settings record
	 * @returns {Promise<DS.Model>} The autocomplete settings record
	 */
	async _getOrCreateSettings() {
		let settingsRecord = null;

		try {
			settingsRecord = await this.store.findRecord("autocomplete", "autocomplete");
		} catch (error) {
			console.log("Creating new autocomplete settings", error);
			settingsRecord = this.store.createRecord("autocomplete", {
				id: "autocomplete",
				API_KEY: ENV.OPENAI?.API_KEY
			});
			await settingsRecord.save();
		}

		return settingsRecord;
	}

	/**
	 * Get headers for API request
	 * @returns {Object} Headers with content type and API key
	 */
	get headers() {
		const apiKey = this.settings?.API_KEY || ENV.OPENAI.API_KEY;

		return {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		};
	}

	/**
	 * Get text suggestions from the OpenAI API
	 * @param {String} text Text to get suggestions for
	 * @returns {Promise<String>} The suggested text
	 */
	async suggest(text) {
		assert(TEXT_MISSING_ERROR_MESSAGE, !isEmpty(text));

		let suggestion = await this._fetchSuggestion(text);
		return suggestion;
	}

	/**
	 * Fetch suggestion from API
	 * @param {String} text Text to get suggestions for
	 * @returns {Promise<String>} The suggested text
	 */
	async _fetchSuggestion(text) {
		const data = {
			...this.config,
			prompt: text
		};

		let suggestion = "";

		try {
			const suggestionResponse = await fetch(this.autocompleteURL, {
				method: "POST",
				headers: this.headers,
				body: JSON.stringify(data)
			});

			const suggestionJSON = await suggestionResponse.json();
			suggestion = suggestionJSON.choices?.[0]?.text || "";
		} catch (error) {
			throw new EmberError(error);
		}

		return suggestion;
	}
}
