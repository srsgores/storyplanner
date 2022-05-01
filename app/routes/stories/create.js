import Route from "@ember/routing/route";

export default class StoriesCreateRoute extends Route {
	async beforeModel() {
		const createdStory = this.store.createRecord("story");
		const savedCreatedStory = await createdStory.save();
		return await this.transitionTo("story.story.timelines", savedCreatedStory);
	}
}
