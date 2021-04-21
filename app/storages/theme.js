import StorageObject from "ember-local-storage/local/object";
import {dasherize} from "@ember/string";

export const themeableOptions = [
	"sidebarWidth",
	"bodyFontFamily",
	"boxSpacing",
	"bodyTextColour",
	"bodyBackgroundColour",
	"bodyBackgroundPrimaryColour",
	"bodyBackgroundOffsetColour",
	"bodyBackgroundGradientDirection",
	"headingBackgroundColour",
	"timelineBackgroundColour",
	"eventBackgroundColour",
	"headerFontSize",
	"headerVerticalPadding"
];

export default class SettingsStorage extends StorageObject {
	_internalModel = {
		modelName: "settings.theme"
	};

	initialState() {
		let initialState = {};
		if (document?.documentElement) {
			const computedStyles = getComputedStyle(document.documentElement);
			for (let option of themeableOptions) {
				initialState[option] = computedStyles.getPropertyValue(`--${dasherize(option)}`);
			}
		}
		return initialState;
	}
}
