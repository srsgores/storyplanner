import Model, {attr, belongsTo} from  "@ember-data/model";

export default class EventModel extends Model {
	@attr("string") title;
	@attr("string") summary;
	@attr("string") text;
	@attr("date", {defaultValue: () => new Date()}) startTime;
	@attr("date", {defaultValue: () => new Date()}) endTime;
	@belongsTo("timeline", {autosave: true}) timeline;
}
