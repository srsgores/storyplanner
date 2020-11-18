import Route from "@ember/routing/route";

export default class StoriesStoryTimelineRoute extends Route {
	model(params) {
		return this.store.findRecord("timeline", params.timeline_id);
	}
}
