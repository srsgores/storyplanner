import Route from "@ember/routing/route";
import {inject as service} from "@ember/service";

export default class ApplicationRoute extends Route {
	@service("router") router;
	@service intl;
	@service session;
	@service("data-sync") dataSync;

	beforeModel() {
		this.intl.setLocale(["en-ca"]);
	}

	setupController(controller) {
		super.setupController(...arguments);
		controller.navItems = ["stories", "settings"];
	}

	// Configure session events
	sessionAuthenticated() {
		// Redirect to the intended route or default route after authentication
		this.router.transitionTo(this.session.attemptedTransition?.routeName || "index");
	}

	sessionInvalidated() {
		// Redirect to login page after logout
		this.router.transitionTo("login");
	}
}
