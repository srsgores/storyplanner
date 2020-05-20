import Model, {attr, hasMany} from "@ember-data/model";

export default class StoryModel extends Model {
	@attr("string") title;
	@attr("string") summary;
	@hasMany("timeline") timelines;
	@hasMany("character") characters;
}
