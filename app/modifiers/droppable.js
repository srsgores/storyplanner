import Modifier from "ember-modifier";
import {action} from "@ember/object";

export default class DroppableModifier extends Modifier {
	DROP_CLASS = "drop-candidate";

	@action
	ondragover(event) {
		event.preventDefault();
		event.stopPropagation();
		this.element.classList.add(this.DROP_CLASS);
		if (this.args.named.ondragover) {
			this.args.named.ondragover(...arguments);
		}
	}

	@action
	ondrop() {
		this.element.classList.remove(this.DROP_CLASS);
		if (this.args.named.ondrop) {
			this.args.named.ondrop(...arguments);
		}
	}

	@action
	ondragleave(event) {
		event.preventDefault();
		this.element.classList.remove(this.DROP_CLASS);
		if (this.args.named.ondragleave) {
			this.args.named.ondragleave(...arguments);
		}
	}

	didInstall() {
		this.element.addEventListener("dragover", this.ondragover);
		this.element.addEventListener("dragleave", this.ondragleave);
		this.element.addEventListener("drop", this.ondrop);
	}

	willRemove() {
		this.element.removeEventListener("dragover", this.ondragover);
		this.element.removeEventListener("dragleave", this.ondragleave);
		this.element.removeEventListener("drop", this.ondrop);
	}
}
