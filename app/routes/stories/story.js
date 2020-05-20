import Route from "@ember/routing/route";

export default class StoriesStoryRoute extends Route {
	model(params) {
		return this.store.queryRecord("story", params.story_id);
	}
}
