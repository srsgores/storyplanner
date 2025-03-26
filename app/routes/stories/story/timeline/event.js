import {inject as service} from "@ember/service";
import Route from "@ember/routing/route";

export default class StoriesStoryTimelineEventRoute extends Route {
	@service("store") store;
	model(params) {
		return this.store.findRecord("event", params.event_id);
	}
}
