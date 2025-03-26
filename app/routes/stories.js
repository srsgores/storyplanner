import {inject as service} from "@ember/service";
import Route from "@ember/routing/route";

export default class StoriesRoute extends Route {
	@service("store") store;
	model() {
		return this.store.findAll("story");
	}
}
