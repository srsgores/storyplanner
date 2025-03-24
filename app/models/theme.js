import Model, {attr} from "@ember-data/model";
import {dasherize} from "@ember/string";

export const themeableOptions = ["sidebarWidth", "bodyFontFamily", "boxSpacing", "bodyTextColour", "bodyBackgroundColour", "bodyBackgroundPrimaryColour", "bodyBackgroundOffsetColour", "bodyBackgroundGradientDirection", "headingBackgroundColour", "timelineBackgroundColour", "eventBackgroundColour", "headerFontSize", "headerVerticalPadding", "nestedTimelineFontSize", "nestedTimelineBackgroundColour"];

/**
 * Theme model for application styling configuration
 * Replaces the previous local-storage implementation
 */
export default class ThemeModel extends Model {
	// Define all themeable options as attributes
	@attr("string") sidebarWidth;
	@attr("string") bodyFontFamily;
	@attr("string") boxSpacing;
	@attr("string") bodyTextColour;
	@attr("string") bodyBackgroundColour;
	@attr("string") bodyBackgroundPrimaryColour;
	@attr("string") bodyBackgroundOffsetColour;
	@attr("string") bodyBackgroundGradientDirection;
	@attr("string") headingBackgroundColour;
	@attr("string") timelineBackgroundColour;
	@attr("string") eventBackgroundColour;
	@attr("string") headerFontSize;
	@attr("string") headerVerticalPadding;
	@attr("string") nestedTimelineFontSize;
	@attr("string") nestedTimelineBackgroundColour;

	/**
	 * Initializes the theme from CSS variables
	 * @returns {Object} The initial state with CSS variable values
	 */
	static initializeFromCSS() {
		const initialState = {};
		const hasDocument = typeof document !== "undefined" && document?.documentElement;

		if (hasDocument) {
			const computedStyles = getComputedStyle(document.documentElement);

			themeableOptions.forEach(option => {
				const cssValue = computedStyles.getPropertyValue(`--${dasherize(option)}`);
				initialState[option] = cssValue || "";
			});
		} else {
			// Set empty defaults if no document available (e.g., server-side rendering)
			themeableOptions.forEach(option => {
				initialState[option] = "";
			});
		}

		return initialState;
	}
}
