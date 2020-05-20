import Model, {attr, hasMany, belongsTo} from "@ember-data/model";

export default class TimelineModel extends Model {
	@attr("string") title;
	@attr("string") summary;
	@belongsTo("story") story;
	@hasMany("timeline", {inverse: "parentTimeline"}) timelines;
	@belongsTo("timeline", {inverse: "timelines"}) parentTimeline;
	@hasMany("event") events;
}
