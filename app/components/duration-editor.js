import Component from "@glimmer/component";
import {tracked} from "@glimmer/tracking";

export const HOUR_THRESHOLD = 1000 * 60 * 60;
export const DAY_THRESHOLD = HOUR_THRESHOLD * 24;

export default class DurationEditorComponent extends Component {
	@tracked unit = "minutes";
	@tracked duration = 5;
}
