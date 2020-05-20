import Component from "@glimmer/component";
import {action} from "@ember/object";
import {inject as service} from "@ember/service";

export default class TimelineComponent extends Component {
	@service store;
	@action addNestedTimeline() {
		const createdTimeline = this.store.createRecord("timeline", {parentTimeline: this.args.timeline});
		return createdTimeline.save().then(() => this.args.timeline.save());
	}
	@action addEvent() {
		const createdEvent = this.store.createRecord("event", {timeline: this.args.timeline});
		return createdEvent.save();
	}
}
