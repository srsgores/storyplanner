import {module, test} from "qunit";
import {setupTest} from "ember-qunit";
import {setupOnerror} from "@ember/test-helpers";
import {TEXT_MISSING_ERROR_MESSAGE} from "@storyplanner-octane/app/services/autocomplete";
module("Unit | Service | autocomplete", function (hooks) {
	setupTest(hooks);

	let autocompleteService;

	hooks.beforeEach(async function () {
		autocompleteService = this.owner.lookup("service:autocomplete");
	});

	test("it exists", function (assert) {
		assert.ok(autocompleteService);
	});

	test("it throws an error when suggest called without text", async function (assert) {
		assert.expect(1);
		setupOnerror(function (error) {
			assert.equal(error.message, TEXT_MISSING_ERROR_MESSAGE);
		});
		autocompleteService.suggest("");
	});
});
