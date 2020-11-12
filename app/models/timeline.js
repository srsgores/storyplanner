import Model, {attr, hasMany, belongsTo} from "@ember-data/model";

export default class TimelineModel extends Model {
	@attr("string") title;
	@attr() summary;
	@belongsTo("story", {autosave: true}) story;
	@hasMany("timeline", {inverse: "parentTimeline", autosave: true}) timelines;
	@belongsTo("timeline", {inverse: "timelines", autosave: true}) parentTimeline;
	@hasMany("event", {autosave: true }) events;
}
