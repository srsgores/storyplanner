import Route from "@ember/routing/route";
import {inject as service} from "@ember/service";

export default class LogoutRoute extends Route {
	@service session;
	beforeModel(transition) {
		transition.abort();
		this.session.invalidate();
		return this.transitionTo("login");
	}
}
