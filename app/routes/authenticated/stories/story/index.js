import Route from "@ember/routing/route";

export default class StoriesStoryIndexRoute extends Route {
	beforeModel() {
		return this.transitionTo("authenticated.stories.story.timelines");
	}
}
