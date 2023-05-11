import Service from "@ember/service";
import {isEmpty} from "@ember/utils";
import {assert} from "@ember/debug";
import ENV from "ember-get-config";
import fetch from "fetch";
import EmberError from "@ember/error";
export default class AutocompleteService extends Service {
	autocompleteURL = "https://api.openai.com/v1/completions";
	config = {
		model: "text-davinci-003",
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
