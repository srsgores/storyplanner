import StorageObject from "ember-local-storage/local/object";
import ENV from "ember-get-config";
export default class AutocompleteStorage extends StorageObject {
	_internalModel = {
		modelName: "settings.autocomplete"
	};

	initialState() {
		return {
			API_KEY: ENV.OPENAI?.API_KEY
		};
	}
}
