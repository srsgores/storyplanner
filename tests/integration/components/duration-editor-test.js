import {module, test} from "qunit";
import {setupRenderingTest} from "ember-qunit";
import {render} from "@ember/test-helpers";
import {hbs} from "ember-cli-htmlbars";
import {HOUR_THRESHOLD, DAY_THRESHOLD} from "storyplanner-octane/components/duration-editor";

const SELECTORS = {
	DURATION_INPUT: "[name=\"duration\"]",
	UNIT_SELECT: "[name=\"unit\"]"
};

module("Integration | Component | duration-editor", function(hooks) {
	setupRenderingTest(hooks);

	test("it renders", async function(assert) {
		this.set("model", {duration: 500});
		const templateBlockText = "template block text";
		this.set("templateBlockText", templateBlockText);

		await render(hbs`<DurationEditor @model={{this.model}}/>`);

		assert.dom(this.element).doesNotIncludeText(templateBlockText);

		// Template block usage:
		await render(hbs`
			<DurationEditor @model={{this.model}}>{{this.templateBlockText}}</DurationEditor>
		`);

		assert.dom(this.element).containsText(templateBlockText);
	});

	test("it sets the initial duration to the passed-in @duration", async function(assert) {
		const duration = 500;
		this.set("model", {duration});
		await render(hbs`<DurationEditor @model={{this.model}}/>`);
		assert.dom(SELECTORS.DURATION_INPUT).hasValue(`${duration}`);
	});

	test("it defaults to minutes when duration less than 1 hour", async function(assert) {
		this.set("model", {duration: HOUR_THRESHOLD + -1});
		await render(hbs`<DurationEditor @model={{this.model}}/>`);
		assert.dom(SELECTORS.UNIT_SELECT).hasValue("minutes");
	});

	test("it defaults to hours when duration greater than 1 hour", async function(assert) {
		this.set("model", {duration: HOUR_THRESHOLD + 1});
		await render(hbs`<DurationEditor @model={{this.model}}/>`);
		assert.dom(SELECTORS.UNIT_SELECT).hasValue("hours");
	});

	test("it defaults to days when duration greater than 1 day", async function(assert) {
		this.set("model", {duration: DAY_THRESHOLD + 1});
		await render(hbs`<DurationEditor @model={{this.model}}/>`);
		assert.dom(SELECTORS.UNIT_SELECT).hasValue("days");
	});
});
