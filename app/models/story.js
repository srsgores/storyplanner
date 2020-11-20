import Model, {attr, hasMany} from "@ember-data/model";

export default class StoryModel extends Model {
	get totalWordCount() {
		return this.events.reduce((totalCount, event) => {
			return totalCount + event.text?.wordCount;
		}, 0);
	}
	@attr("string") title;
	@attr() summary;
	@hasMany("timeline", {autosave: true}) timelines;
	@hasMany("character", {autosave: true}) characters;
	@hasMany("event", {autosave: true}) events;
}
