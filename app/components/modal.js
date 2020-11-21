import Component from "@glimmer/component";
import {reads} from "@ember/object/computed";
import {inject as service} from "@ember/service";
import {action} from "@ember/object";

const ESCAPE_KEYCODE = 27;

export default class ModalComponent extends Component {
	@service fastboot;
	@reads("fastboot.isFastBoot") isFastBoot;

	constructor() {
		super(...arguments);
		if (!this.isFastBoot) {
			window.addEventListener("keydown", this.goBack);
		}
	}

	willDestroy() {
		super.willDestroy();
		if (!this.isFastBoot) {
			window.removeEventListener("keydown", this.goBack);
		}
	}

	@action
	goBack(keyCodeEvent) {
		if (keyCodeEvent.keyCode === ESCAPE_KEYCODE) {
			history.back();
		}
	}
}
