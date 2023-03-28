"use strict";

const EmberApp = require("ember-cli/lib/broccoli/ember-app");

module.exports = function (defaults) {
	let app = new EmberApp(defaults, {
		flatpickr: {
			theme: "dark"
		},
		svgJar: {
			sourceDirs: ["public/assets/icons"]
		}
	});

	return app.toTree();
};
