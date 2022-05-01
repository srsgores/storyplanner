import Route from "@ember/routing/route";

export default class StoriesStoryTimelinesRoute extends Route {
	model() {
		return this.modelFor("authenticated.stories.story");
	}
}
