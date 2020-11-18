import Model, {attr, belongsTo, hasMany} from "@ember-data/model";

export default class EventModel extends Model {
	@attr("string") title;
	@attr() summary;
	@attr() text;
	@attr("date", {defaultValue: () => new Date()}) startTime;
	@attr("date", {defaultValue: () => new Date()}) endTime;
	@belongsTo("timeline", {autosave: true}) timeline;
	@hasMany("timeline", {autosave: true}) nestedTimelines;
}
