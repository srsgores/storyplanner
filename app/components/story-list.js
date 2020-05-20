import Component from "@glimmer/component";
import {action} from "@ember/object";
import {inject as service} from "@ember/service";

export default class StoryListComponent extends Component {
	@service store;
	@service router;
	@action async createStory() {
		const createdStory = await this.store.createRecord("story").save();
		return await this.router.transitionTo("stories.story", createdStory);
	}
	@action async removeStory(story) {
		await story.destroyRecord();
		return this.router.transitionTo("stories");
	}
}
