import {inject as service} from "@ember/service";
import Route from "@ember/routing/route";

export default class StoriesStoryIndexRoute extends Route {
	@service("router") router;
	beforeModel() {
		return this.router.transitionTo("stories.story.timelines");
	}
}
