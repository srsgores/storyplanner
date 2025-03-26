import {inject as service} from "@ember/service";
import Controller from "@ember/controller";
import {action} from "@ember/object";

export default class StoriesStoryCharactersController extends Controller {
	@service("router") router;
	@service("store") store;
	@action async addCharacter() {
		const createdCharacter = this.store.createRecord("character", {
			story: this.story
		});
		const savedCharacter = await createdCharacter.save();
		return this.router.transitionTo("stories.story.characters.character", savedCharacter);
	}
}
