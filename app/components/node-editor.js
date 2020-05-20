import Component from "@glimmer/component";
import {guidFor} from "@ember/object/internals";

export default class NodeEditorComponent extends Component {
	get hasSummary() {
		return this.args.node.summary !== undefined;
	}
	elementId = guidFor(this);
}
