import Route from "@ember/routing/route";

export default class StoriesStoryLocationsLocationRoute extends Route {
	model(params) {
		return this.store.findRecord("location", params.location_id);
	}
}
