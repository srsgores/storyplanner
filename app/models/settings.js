import Model, {attr} from "@ember-data/model";

/**
 * Settings model for application configuration
 * Replaces the previous local-storage implementation
 */
export default class SettingsModel extends Model {
	@attr("number", {defaultValue: 1000}) maxWordCount;
}
