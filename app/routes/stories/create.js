import Route from "@ember/routing/route";

export default class StoriesCreateRoute extends Route {
	beforeModel() {
		return this.store
			.createRecord("story")
			.save()
			.then((createdStory) =>
				this.transitionTo("stories.story.timelines", createdStory)
			);
	}
}
