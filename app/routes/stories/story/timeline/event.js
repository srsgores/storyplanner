import Route from "@ember/routing/route";

export default class StoriesStoryTimelineEventRoute extends Route {
	model(params) {
		return this.store.findRecord("event", params.event_id);
	}
}
