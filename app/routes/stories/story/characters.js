import Route from "@ember/routing/route";

export default class StoriesStoryCharactersRoute extends Route {
	model() {
		return this.store.findAll("character");
	}

	setupController(controller) {
		super.setupController(...arguments);
		controller.set("story", this.modelFor("stories.story"));
	}
}
