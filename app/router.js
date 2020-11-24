import EmberRouter from "@ember/routing/router";
import config from "./config/environment";

export default class Router extends EmberRouter {
	location = config.locationType;
	rootURL = config.rootURL;
}

Router.map(function() {
	this.route("stories", function() {
		this.route("story", {path: ":story_id"}, function() {
			this.route("timelines", function() {
				this.route("event", {path: ":event_id"});
			});
			this.route("characters", function() {
				this.route("character", {path: ":character_id"});
			});
			this.route("preview");
			this.route("locations", function() {
				this.route("location", {path: ":location_id"});
			});
		});
		this.route("create");
	});
});
