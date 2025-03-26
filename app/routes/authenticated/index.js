import Route from "@ember/routing/route";
import {inject as service} from "@ember/service";

export default class AuthenticatedIndexRoute extends Route {
	@service("router") router;
	@service session;

	beforeModel(transition) {
		// Check authentication
		if (!this.session.isAuthenticated) {
			this.session.requireAuthentication(transition, "login");
			return;
		}

		// Redirect to stories
		return this.router.transitionTo("authenticated.stories");
	}
}
