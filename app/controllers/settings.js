import Controller from "@ember/controller";
import {action} from "@ember/object";
import {inject as service} from "@ember/service";
import {tracked} from "@glimmer/tracking";

export default class SettingsController extends Controller {
	@service settings;
	@tracked uploadedSettingsFile;

	readFile(file) {
		const reader = new FileReader();
		return new Promise(resolve => {
			reader.onload = function (event) {
				resolve({
					file: file.name,
					type: file.type,
					data: event.target.result,
					size: file.size
				});
			};
			reader.readAsText(file);
		});
	}

	@action exportData() {
		return this.store.exportData(["stories", "characters", "timelines", "events", "locations"], {download: true, filename: `${Date.now()}-stories-backup`});
	}

	@action importData(event) {
		this.readFile(event.target.files[0]).then(file => {
			this.store.importData(file.data);
			alert(`File ${file.file} imported: ${file.size} bytes`);
			this.uploadedSettingsFile = "";
		});
	}
}
