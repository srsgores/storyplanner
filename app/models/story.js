import Model, {attr, hasMany} from "@ember-data/model";

export default class StoryModel extends Model {
	@attr("timestamp") createdDate;
	get totalWordCount() {
		return this.events.reduce((totalCount, event) => {
			return totalCount + event.text?.wordCount;
		}, 0);
	}
	@attr("string") title;
	@attr() summary;
	@hasMany("timeline", {autosave: true, isRealtime: true}) timelines;
	@hasMany("character", {autosave: true, isRealtime: true}) characters;
	@hasMany("location", {autosave: true, isRealtime: true}) locations;
	@hasMany("event", {autosave: true, isRealtime: true}) events;
}
