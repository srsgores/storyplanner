import Route from "@ember/routing/route";

export default class StoriesStoryTimelineEventRoute extends Route {
	model(params) {
		return this.store.queryRecord("event", params.event_id);
	}
}
