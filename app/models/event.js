import Model, {attr, belongsTo, hasMany} from "@ember-data/model";

export default class EventModel extends Model {
	@attr("string") title;
	@attr() summary;
	@attr() text;
	@attr("date", {defaultValue: () => new Date()}) startTime;
	@attr("date", {defaultValue: () => new Date(Date.now() + 300000)}) endTime;
	@belongsTo("timeline", {autosave: true}) timeline;
	@hasMany("timeline", {autosave: true}) nestedTimelines;
	@belongsTo("story", {autosave: true}) story;
}
