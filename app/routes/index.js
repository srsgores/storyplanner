import {inject as service} from "@ember/service";
import Route from "@ember/routing/route";

export default class IndexRoute extends Route {
	@service("router") router;
	beforeModel() {
		return this.router.transitionTo("stories");
	}
}
