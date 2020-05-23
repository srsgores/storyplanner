import Component from "@glimmer/component";
import {action, computed} from "@ember/object";
import {tracked} from "@glimmer/tracking";
import {inject as service} from "@ember/service";

export default class TimelineComponent extends Component {
	@service store;
	@tracked sorting = ["startTime"];
	@computed.sort("args.timeline.events", "sorting") sortedEvents;
	@action addNestedTimeline() {
		const createdTimeline = this.store.createRecord("timeline", {parentTimeline: this.args.timeline});
		return createdTimeline.save().then(() => this.args.timeline.save());
	}
	@action async addEvent(eventAfter) {
		const createdEvent = this.store.createRecord("event", {timeline: this.args.timeline});
		if (eventAfter && eventAfter.startTime) {
			createdEvent.startTime = new Date(eventAfter.startTime.getTime() + 1);
		}
		await createdEvent.save();
		await this.args.timeline.save();
	}
	@action remove() {
		return this.args.timeline.destroyRecord();
	}
	@action removeEvent(event) {
		return event.destroyRecord();
	}
}
