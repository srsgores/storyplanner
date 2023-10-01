import {module, test} from "qunit";
import {setupRenderingTest} from "ember-qunit";
import {render} from "@ember/test-helpers";
import {hbs} from "ember-cli-htmlbars";

module("Integration | Component | content-editor", function (hooks) {
	setupRenderingTest(hooks);

	test("it renders", async function (assert) {
		this.templateBlockText = "template block text";
		await render(hbs`<ContentEditor/>`);

		assert.equal(this.element.textContent.trim(), "");

		// Template block usage:
		await render(hbs`
			<ContentEditor>
				{{this.templateBlockText}}
			</ContentEditor>
		`);

		assert.equal(this.element.textContent.trim(), this.templateBlockText);
	});
});
