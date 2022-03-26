"use strict";

module.exports = {
	extends: "recommended",
	rules: {
		"no-bare-strings": true,
		"attribute-indentation": false,
		"block-indentation": "tab",
		"no-invalid-interactive": {
			ignoredTags: ["form"]
		}
	}
};
