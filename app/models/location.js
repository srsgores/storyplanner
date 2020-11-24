import Model, {attr, belongsTo} from "@ember-data/model";

export default class LocationModel extends Model {
	@attr("string") name;
	@attr() description;
	@belongsTo("story", {autosave: true, inverse: "locations"}) story;
}
