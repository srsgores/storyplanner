import Model, {attr, belongsTo, hasMany} from "@ember-data/model";

export default class EventModel extends Model {
	@attr("timestamp") createdDate;
	@attr("string") title;
	@attr() summary;
	@attr() text;
	@attr("number") duration;
	@attr("date", {defaultValue: () => new Date()}) startTime;
	@attr("date", {defaultValue: () => new Date(Date.now() + 300000)}) endTime;
	@belongsTo("timeline", {autosave: true, isRealtime: true}) timeline;
	@hasMany("timeline", {autosave: true, isRealtime: true}) nestedTimelines;
	@belongsTo("story", {autosave: true, isRealtime: true}) story;
}
