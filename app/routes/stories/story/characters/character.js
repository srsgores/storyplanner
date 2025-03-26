import {inject as service} from "@ember/service";
import Route from "@ember/routing/route";

export default class StoriesStoryCharactersCharacterRoute extends Route {
	@service("store") store;
	model(params) {
		return this.store.findRecord("character", params.character_id);
	}
}
