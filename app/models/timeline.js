import Model, {attr, hasMany, belongsTo} from "@ember-data/model";

export default class TimelineModel extends Model {
	@attr("timestamp") createdDate;
	@attr("string") title;
	@attr() summary;
	@belongsTo("story", {autosave: true, isRealtime: true}) story;
	@hasMany("event", {autosave: true, inverse: "timeline", isRealtime: true}) events;
	@belongsTo("event", {autosave: true, inverse: "nestedTimelines", isRealtime: true}) parentEvent;
}
