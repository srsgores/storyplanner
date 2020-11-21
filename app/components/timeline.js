import Component from "@glimmer/component";
import {action, computed} from "@ember/object";
import {tracked} from "@glimmer/tracking";
import {inject as service} from "@ember/service";

export default class TimelineComponent extends Component {
	@service store;
	@tracked sorting = ["startTime"];
	@tracked draggedEvent;
	@computed.sort("args.timeline.events", "sorting") sortedEvents;

	@action async addEvent(eventAfter) {
		const createdEvent = this.store.createRecord("event", {timeline: this.args.timeline, story: this.args.story});
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

	@action async addTimelineToEvent(event) {
		const defaultStartingEvent = this.store.createRecord("event", {story: this.args.story});
		const createdTimeline = this.store.createRecord("timeline", {parentEvent: event, events: [defaultStartingEvent]});
		await createdTimeline.save();
		await event.save();
		return await defaultStartingEvent.save();
	}

	@action moveEventBefore(droppedEvent, targetEvent) {
		if (droppedEvent !== targetEvent && targetEvent.startTime) {
			const oneMinuteBeforeStartTime = new Date(targetEvent.startTime.getTime() - 1 * 60000);
			droppedEvent.startTime = oneMinuteBeforeStartTime;
			return droppedEvent.save();
		}
	}
}
