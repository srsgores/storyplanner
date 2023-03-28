import Controller from "@ember/controller";
import {action} from "@ember/object";
import {inject as service} from "@ember/service";

export default class StoriesStoryLocationsController extends Controller {
	@service router;
	@action addLocation() {
		const createdLocation = this.store.createRecord("location", {
			story: this.story
		});
		return createdLocation.save().then((savedLocation) => {
			this.transitionToRoute(
				"stories.story.locations.location",
				savedLocation
			);
			return this.model.update();
		});
	}
	@action removeLocation(location) {
		return location
			.destroyRecord()
			.then(() => this.router.transitionTo("stories.story.locations"));
	}
}
