import Model, {attr, hasMany, belongsTo} from "@ember-data/model";

export default class TimelineModel extends Model {
	@attr("string") title;
	@attr() summary;
	@belongsTo("story", {autosave: true}) story;
	@hasMany("event", {autosave: true, inverse: "timeline"}) events;
	@belongsTo("event", {autosave: true, inverse: "nestedTimelines"})
	parentEvent;
}
