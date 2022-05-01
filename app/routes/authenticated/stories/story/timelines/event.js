import Route from "@ember/routing/route";

export default class StoriesStoryTimelinesEventRoute extends Route {
	model(params) {
		return this.store.findRecord("event", params.event_id);
	}
}
