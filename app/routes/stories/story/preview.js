import Route from "@ember/routing/route";

export default class StoriesStoryPreviewRoute extends Route {
	async model() {
		const activeStory = this.modelFor("stories.story");
		const activeStoryID = activeStory.id;
		const events = await this.store.query("event", {
			filter: {
				story: activeStoryID
			}
		});
		return {
			events,
			story: activeStory
		};
	}
}
