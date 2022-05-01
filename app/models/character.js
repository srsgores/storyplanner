import Model, {attr, belongsTo} from "@ember-data/model";

export default class CharacterModel extends Model {
	@attr("timestamp") createdDate;
	@attr("string") name;
	@attr("string") title;
	@attr("string") gender;
	@attr("string") sexuality;
	@attr("number") age;
	@attr() background;
	@attr() notes;
	@attr() firstImpression;
	@attr() corePersonality;
	@belongsTo("story", {autosave: true, inverse: "characters", isRealtime: true}) story;
}
