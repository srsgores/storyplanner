import Route from "@ember/routing/route";

export default class StoriesStoryCharactersCharacterRoute extends Route {
	model(params) {
		const storyModel = this.modelFor("stories.story");
		return this.store.findRecord("character", params.character_id).then((resolvedCharacter) => {
			return {
				character: resolvedCharacter,
				story: storyModel
			};
		});
	}
}
