import {module, test} from "qunit";
import {setupTest} from "ember-qunit";

module("Unit | Route | stories/story/timelines/event", function (hooks) {
	setupTest(hooks);

	test("it exists", function (assert) {
		let route = this.owner.lookup("route:stories/story/timelines/event");
		assert.ok(route);
	});
});
