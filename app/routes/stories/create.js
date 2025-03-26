import {inject as service} from "@ember/service";
import Route from "@ember/routing/route";

export default class StoriesCreateRoute extends Route {
	@service("router") router;
	@service("store") store;
	async beforeModel() {
		const createdStory = this.store.createRecord("story");
		const savedStory = await createdStory.save();
		this.router.transitionTo("stories.story.timelines", savedStory);
	}
}
