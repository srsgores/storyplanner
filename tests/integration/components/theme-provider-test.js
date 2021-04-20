import {module, test} from "qunit";
import {setupRenderingTest} from "ember-qunit";
import {render} from "@ember/test-helpers";
import {hbs} from "ember-cli-htmlbars";

module("Integration | Component | theme-provider", function(hooks) {
	setupRenderingTest(hooks);

	test("it renders", async function(assert) {
		await render(hbs`<ThemeProvider/>`);

		assert.equal(this.element.textContent.trim(), "");

		// Template block usage:
		await render(hbs`
		<ThemeProvider>
			template block text
		</ThemeProvider>
	`);

		assert.equal(this.element.textContent.trim(), "template block text");
	});
});
