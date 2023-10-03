import {module, test} from "qunit";
import {setupRenderingTest} from "ember-qunit";
import Service from "@ember/service";
import {typeIn, render} from "@ember/test-helpers";
import {hbs} from "ember-cli-htmlbars";

const SELECTORS = {
	TEXTAREA: ".content-editor"
};

module("Integration | Component | content-editor", function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(async function () {
		const autocompleteService = this.owner.lookup("service:autocomplete");
		let autocompleteServiceStub = Service.extend(autocompleteService);
		this.owner.register("service:autocomplete", autocompleteServiceStub);
	});

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

	test("it autocompletes when @autocomplete set to true", async function (assert) {
		assert.expect(1);
		const typedText = "typing with delay";
		let autocompleteServiceStub = this.owner.lookup("service:autocomplete");
		autocompleteServiceStub.suggest = async function (text) {
			assert.equal(text, typedText, `autocomplete prompt matches exact text, ${typedText}, due to delay`);
		};
		await render(hbs`<ContentEditor @autocomplete={{true}}/>`);
		await typeIn(SELECTORS.TEXTAREA, typedText);
	});

	test("it does not autocomplete when @autocomplete not set", async function (assert) {
		assert.expect(0);
		const typedText = "typing with delay";
		let autocompleteServiceStub = this.owner.lookup("service:autocomplete");
		autocompleteServiceStub.suggest = async function () {
			assert.notOk();
		};
		await render(hbs`<ContentEditor/>`);
		await typeIn(SELECTORS.TEXTAREA, typedText);
	});
});
