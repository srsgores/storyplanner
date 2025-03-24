import Model, {attr} from "@ember-data/model";
import ENV from "ember-get-config";

/**
 * Autocomplete settings model
 * Replaces the previous local-storage implementation
 */
export default class AutocompleteModel extends Model {
	@attr("string", {defaultValue: ENV.OPENAI?.API_KEY}) API_KEY;
}
