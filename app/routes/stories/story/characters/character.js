import Route from "@ember/routing/route";

export default class StoriesStoryCharactersCharacterRoute extends Route {
	model(params) {
		return this.store.findRecord("character", params.character_id);
	}
}
