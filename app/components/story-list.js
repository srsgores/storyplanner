import Component from "@glimmer/component";
import {action} from "@ember/object";
import {inject as service} from "@ember/service";

export default class StoryListComponent extends Component {
	@service router;
	@action async removeStory(story) {
		await story.destroyRecord();
		return this.router.transitionTo("stories");
	}
}
