import {module, test} from "qunit";
import {setupRenderingTest} from "ember-qunit";
import {render} from "@ember/test-helpers";
import {hbs} from "ember-cli-htmlbars";

const SELECTORS = {
	DURATION_INPUT: ".duration-input"
};

module("Integration | Component | inputs/duration-input", function (hooks) {
	setupRenderingTest(hooks);

	test("it converts milliseconds to duration in seconds", async function (assert) {
		this.duration = 5000;
		await render(hbs`<DurationInput @value={{this.duration}}/>`);
		assert.dom(SELECTORS.DURATION_INPUT).hasValue("5 seconds");
	});
});
