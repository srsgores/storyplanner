import StorageObject from "ember-local-storage/local/object";

export default class SettingsStorage extends StorageObject {
	initialState() {
		return {
			maxWordCount: 1000,
		}
	}
}
