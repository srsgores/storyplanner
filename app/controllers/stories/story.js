import Controller from "@ember/controller";

export default class StoriesStoryController extends Controller {
	get navItems() {
		return [
			{
				route: "stories.story.timelines",
				model: this.model,
				text: "Timelines",
				icon: "linear_scale"
			},
			{
				route: "stories.story.characters",
				model: this.model,
				text: "Characters",
				icon: "people_alt"
			},
			{
				route: "stories.story.locations",
				model: this.model,
				text: "Locations",
				icon: "location_city"
			},
			{
				route: "stories.story.preview",
				model: this.model,
				text: "Preview",
				icon: "preview"
			}
		];
	}
}
