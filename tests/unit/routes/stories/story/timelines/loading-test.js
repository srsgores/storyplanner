import {module, test} from "qunit";
import {setupTest} from "ember-qunit";

module("Unit | Route | stories/story/timelines/loading", function (hooks) {
	setupTest(hooks);

	test("it exists", function (assert) {
		let route = this.owner.lookup("route:stories/story/timelines/loading");
		assert.ok(route);
	});
});
