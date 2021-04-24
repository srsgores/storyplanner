import Component from "@glimmer/component";

export default class EventPreviewComponent extends Component {
	get eventDuration() {
		return this.args.event.endTime - this.args.event.startTime;
	}
}
