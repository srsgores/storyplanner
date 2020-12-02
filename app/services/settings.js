import Service from "@ember/service";
import {storageFor} from "ember-local-storage";

export default class SettingsService extends Service {
	@storageFor("settings") settings;
}
