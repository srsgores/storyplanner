import Component from "@glimmer/component";
import {action} from "@ember/object";
import {inject as service} from "@ember/service";
import {SUPPORTED_ATOMS, SUPPORTED_CARDS} from "./content-editor";

export default class StoryListComponent extends Component {
	cardNames = SUPPORTED_CARDS;
	atomNames = SUPPORTED_ATOMS;
	@service router;
	@action async removeStory(story) {
		await story.destroyRecord();
		return this.router.transitionTo("stories");
	}
}
