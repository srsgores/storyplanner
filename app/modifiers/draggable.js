import Modifier from "ember-modifier";
import {action} from "@ember/object";

export default class DraggableModifier extends Modifier {
	DRAG_CLASS = "dragging";

	@action
	ondragstart() {
		this.element.classList.add(this.DRAG_CLASS);
		if (this.args.named.ondragstart) {
			this.args.named.ondragstart(...arguments);
		}
	}

	@action
	ondrag() {
		if (this.args.named.ondrag) {
			this.args.named.ondrag(...arguments);
		}
	}

	@action
	ondragend() {
		this.element.classList.remove(this.DRAG_CLASS);
		if (this.args.named.ondragend) {
			this.args.named.ondragend(...arguments);
		}
	}

	didInstall() {
		this.element.setAttribute("draggable", true);
		this.element.addEventListener("dragstart", this.ondragstart);
		this.element.addEventListener("dragend", this.ondragend);
		this.element.addEventListener("drag", this.ondrag);
	}

	willRemove() {
		this.element.removeEventListener("dragstart", this.ondragstart);
		this.element.removeEventListener("dragend", this.ondragend);
		this.element.removeEventListener("drag", this.ondrag);
	}
}
