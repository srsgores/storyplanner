import Component from "@glimmer/component";
import {action} from "@ember/object";
import {guidFor} from "@ember/object/internals";
import EventModel from "../models/event";

export default class NodeEditorComponent extends Component {
	get hasSummary() {
		return this.args.node.summary !== undefined;
	}
	get isEvent() {
		return this.args.node instanceof EventModel;
	}
	@action save() {
		return this.args.node.save();
	}
	elementId = guidFor(this);
}
