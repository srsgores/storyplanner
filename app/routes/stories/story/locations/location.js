import {inject as service} from "@ember/service";
import Route from "@ember/routing/route";

export default class StoriesStoryLocationsLocationRoute extends Route {
	@service("store") store;
	model(params) {
		return this.store.findRecord("location", params.location_id);
	}
}
