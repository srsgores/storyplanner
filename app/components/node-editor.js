import Component from "@glimmer/component";
import {action} from "@ember/object";
import {guidFor} from "@ember/object/internals";
import EventModel from "../models/event";
import {tracked} from "@glimmer/tracking";

export default class NodeEditorComponent extends Component {
	@tracked eventTimingsToggled = false;

	get hasSummary() {
		return this.args.node.summary !== undefined;
	}

	get isEvent() {
		return this.args.node instanceof EventModel;
	}

	get eventDuration() {
		return this.args.node.endTime - this.args.node.startTime;
	}

	@action save() {
		return this.args.node.save();
	}

	@action toggleEditEventTimings() {
		this.eventTimingsToggled = !this.eventTimingsToggled;
	}

	elementId = guidFor(this);
}
