import Controller from "@ember/controller";
import {action} from "@ember/object";

export default class StoriesStoryCharactersController extends Controller {
	@action addCharacter() {
		const createdCharacter = this.store.createRecord("character", {story: this.story});
		return createdCharacter.save().then((savedCharacter) => {
			this.transitionToRoute("stories.story.characters.character", savedCharacter);
		});
	}
}
