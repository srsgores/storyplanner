import Route from "@ember/routing/route";
import {inject as service} from "@ember/service";

export default class ApplicationRoute extends Route {
	@service intl;

	beforeModel() {
		super.beforeModel(...arguments);
		this.intl.setLocale(["en-ca"]);
	}
	setupController(controller) {
		super.afterModel();
		controller.set("navItems", [{route: "stories", text: "Stories"}, {route: "settings", text: "Settings"}]);
	}
}
