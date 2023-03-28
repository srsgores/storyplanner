import Component from "@glimmer/component";
import {action} from "@ember/object";
import {inject as service} from "@ember/service";

export default class StoryEditorComponent extends Component {
	@service store;

	@action async addTimeline() {
		const createdTimeline = this.store.createRecord("timeline", {
			story: this.args.story
		});
		const defaultStaringEvent = this.store.createRecord("event", {
			timeline: createdTimeline,
			story: this.args.story
		});
		await defaultStaringEvent.save();
		await createdTimeline.save();
		return this.args.story.save();
	}

	@action save() {
		return this.args.story.save();
	}
}
