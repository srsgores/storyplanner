import Controller from "@ember/controller";
import {action} from "@ember/object";
import {inject as service} from "@ember/service";

export default class StoriesStoryLocationsController extends Controller {
	@service router;
	@action async addLocation() {
		const createdLocation = this.store.createRecord("location", {
			story: this.story
		});
		const savedLocation = await createdLocation.save();
		this.transitionToRoute(
			"stories.story.locations.location",
			savedLocation
		);
		return this.model.update();
	}
	@action async removeLocation(location) {
		await location.destroyRecord();
		return this.router.transitionTo("stories.story.locations");
	}
}
