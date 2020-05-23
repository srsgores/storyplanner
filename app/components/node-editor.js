import Component from "@glimmer/component";
import {action} from "@ember/object";
import {guidFor} from "@ember/object/internals";

export default class NodeEditorComponent extends Component {
	get hasSummary() {
		return this.args.node.summary !== undefined;
	}
	@action save() {
		return this.args.node.save();
	}
	elementId = guidFor(this);
}
