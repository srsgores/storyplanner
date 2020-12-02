import Route from "@ember/routing/route";

export default class ApplicationRoute extends Route {
	constructor() {
		super(...arguments);
	}
	setupController(controller) {
		super.afterModel();
		controller.set("navItems", [{route: "stories", text: "Stories"}, {route: "settings", text: "Settings"}]);
	}
}
