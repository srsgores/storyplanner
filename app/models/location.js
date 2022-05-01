import Model, {attr, belongsTo} from "@ember-data/model";

export default class LocationModel extends Model {
	@attr("timestamp") createdDate;
	@attr("string") name;
	@attr() description;
	@belongsTo("story", {autosave: true, inverse: "locations", isRealtime: true}) story;
}
