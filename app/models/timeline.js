import Model, {attr, hasMany} from "@ember-data/model";

export default class TimelineModel extends Model {
	@attr("string") title;
	@attr("string") summary;
	@hasMany("event") events;
}
