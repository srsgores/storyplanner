import Component from "@glimmer/component";
import {computed} from "@ember/object";
import {isEmpty} from "@ember/utils";

export default class StoryPreviewComponent extends Component {
	@computed.filter("args.storyEvents", function(event) {
		return !isEmpty(event.text?.sections);
	}) eventsWithText;
	@computed.notEmpty("eventsWithText") hasText;
	eventSorting = ["startTime:asc"];
	@computed.sort("eventsWithText", "eventSorting") sortedEvents;
}
