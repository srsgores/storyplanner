import {inject as service} from "@ember/service";
import Route from "@ember/routing/route";

export default class StoriesStoryRoute extends Route {
	@service("store") store;
	model(params) {
		return this.store.findRecord("story", params.story_id);
	}
}
