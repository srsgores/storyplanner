import Route from "@ember/routing/route";

export default class StoriesStoryPreviewRoute extends Route {
	model() {
		const activeStory = this.modelFor("stories.story");
		const activeStoryID = activeStory.id;
		return this.store.query("event", {
			filter: {
				story: activeStoryID
			}
		}).then((events) => {
			return {
				events,
				story: activeStory
			}
		});
	}
}
