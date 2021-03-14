import Route from "@ember/routing/route";

export default class StoriesStoryLocationsRoute extends Route {
	model() {
		const story = this.modelFor("stories.story");
		return this.store.query("location", {
			filter: {
				story: story.id
			}
		});
	}

	setupController(controller) {
		super.setupController(...arguments);
		controller.set("story", this.modelFor("stories.story"));
	}
}
