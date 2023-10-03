import Route from "@ember/routing/route";

export default class StoriesCreateRoute extends Route {
	async beforeModel() {
		const createdStory = this.store.createRecord("story");
		const savedStory = await createdStory.save();
		this.transitionTo("stories.story.timelines", savedStory);
	}
}
