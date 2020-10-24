import Route from "@ember/routing/route";

export default class StoriesStoryTimelineRoute extends Route {
	model(params) {
		return this.store.queryRecord("timeline", params.timeline_id);
	}
}
