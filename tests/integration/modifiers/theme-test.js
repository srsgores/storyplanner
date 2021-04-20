import {module, test} from "qunit";
import {setupRenderingTest} from "ember-qunit";
import {render} from "@ember/test-helpers";
import {hbs} from "ember-cli-htmlbars";

module("Integration | Modifier | theme", function(hooks) {
	setupRenderingTest(hooks);

	// Replace this with your real tests.
	test("it renders", async function(assert) {
		await render(hbs`<div {{theme}}></div>`);

		assert.ok(true);
	});
});
