import Service from "@ember/service";
import {isEmpty} from "@ember/utils";
import {assert} from "@ember/debug";
import ENV from "ember-get-config";
import fetch from "fetch";
import EmberError from "@ember/error";

export const TEXT_MISSING_ERROR_MESSAGE = "text must not be empty";

export const AUTOCOMPLETE_API_URL = "https://api.openai.com/v1/completions";
export default class AutocompleteService extends Service {
	autocompleteURL = AUTOCOMPLETE_API_URL;
	config = {
		model: ENV.OPENAI.MODEL,
		n: 1,
		stop: ["\n"]
	};
	headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${ENV.OPENAI.API_KEY}`
	};
	async suggest(text) {
		assert("text must not be empty", !isEmpty(text));
		const data = {
			...this.config,
			prompt: text
		};
		let suggestion;
		try {
			const suggestionResponse = await fetch(this.autocompleteURL, {
				method: "POST",
				headers: this.headers,
				body: JSON.stringify(data)
			});
			const suggestionJSON = await suggestionResponse.json();
			suggestion = suggestionJSON.choices?.[0]?.text;
		} catch (error) {
			throw new EmberError(error);
		}
		return suggestion;
	}
}
