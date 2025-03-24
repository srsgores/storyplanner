import Controller from "@ember/controller";
import {action} from "@ember/object";

export default class StoriesStoryCharactersController extends Controller {
	@action async addCharacter() {
		const createdCharacter = this.store.createRecord("character", {
			story: this.story
		});
		const savedCharacter = await createdCharacter.save();
		return this.transitionToRoute("stories.story.characters.character", savedCharacter);
	}
}
