import StorageObject from "ember-local-storage/local/object";

export default class SettingsStorage extends StorageObject {
	_internalModel = {
		modelName: "settings"
	};

	initialState() {
		return {
			maxWordCount: 1000
		};
	}
}
