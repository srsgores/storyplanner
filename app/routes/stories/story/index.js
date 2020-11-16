import Route from "@ember/routing/route";

export default class StoriesStoryIndexRoute extends Route {
	model() {
		return this.modelFor("stories.story");
	}
}
