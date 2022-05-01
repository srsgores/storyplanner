import Route from "@ember/routing/route";

export default class StoriesRoute extends Route {
	model() {
		return this.store.findAll("story");
	}
}
