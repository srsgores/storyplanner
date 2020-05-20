import Model, {attr} from "@ember-data/model";

export default class CharacterModel extends Model {
	@attr("string") name;
	@attr("string") title;
	@attr("number") age;
}
