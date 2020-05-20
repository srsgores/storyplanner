import Model, {attr, belongsTo} from  "@ember-data/model";

export default class EventModel extends Model {
	@attr("string") title;
	@attr("string") description;
	@attr("date") startTime;
	@attr("date") endTime;
	@belongsTo("timeline") timeline;
}
