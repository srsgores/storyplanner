import Route from "@ember/routing/route";
import {inject as service} from "@ember/service";
import ApplicationRouteMixin from "ember-simple-auth/mixins/application-route-mixin";

export default class ApplicationRoute extends Route.extend(ApplicationRouteMixin) {
	@service intl;
	@service session;
	@service("data-sync") dataSync;

	beforeModel() {
		super.beforeModel(...arguments);
		this.intl.setLocale(["en-ca"]);
	}
	setupController(controller) {
		super.afterModel();
		controller.navItems = ["stories", "settings"];
	}

	// Configure session events if needed
	sessionAuthenticated() {
		// The default implementation will redirect to configure.routeAfterAuthentication
		// which defaults to 'index'
		super.sessionAuthenticated(...arguments);
	}

	sessionInvalidated() {
		// The default implementation will redirect to configure.routeAfterInvalidation
		// which defaults to 'login' if it exists or 'index' otherwise
		super.sessionInvalidated(...arguments);
	}
}
