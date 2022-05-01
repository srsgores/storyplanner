import Component from "@glimmer/component";
import {action} from "@ember/object";
import {inject as service} from "@ember/service";

export default class CharacterListComponent extends Component {
	@service router;
	@action async removeCharacter(character) {
		await character.destroyRecord();
		return await this.router.transitionTo("stories.story.characters");
	}
}
