import {module, test} from "qunit";
import {setupTest} from "ember-qunit";

module("Unit | Route | stories/story/characters/character", function (hooks) {
	setupTest(hooks);

	test("it exists", function (assert) {
		let route = this.owner.lookup("route:stories/story/characters/character");
		assert.ok(route);
	});
});
