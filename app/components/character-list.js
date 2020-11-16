import Component from "@glimmer/component";
import {action} from "@ember/object";
import {inject as service} from "@ember/service";

export default class CharacterListComponent extends Component {
	@service router;
	@action removeCharacter(character) {
		return character.destroyRecord().then(() => this.router.transitionTo("stories.story.characters"));
	}
}
