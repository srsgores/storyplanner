import Service from "@ember/service";
import {inject as service} from "@ember/service";
import {action} from "@ember/object";
import {themeableOptions} from "../models/theme";
import {dasherize} from "@ember/string";

export default class ThemeProviderService extends Service {
	@service settings;

	/**
	 * Update theme CSS variables on the document root
	 * @param {Object} theme - Theme settings object
	 */
	@action applyTheme(theme = {}) {
		const hasDocument = typeof document !== "undefined" && document?.documentElement;

		if (hasDocument) {
			const root = document.documentElement;
			const computedStyles = getComputedStyle(root);

			themeableOptions.forEach(option => {
				const value = theme[option];
				if (value) {
					root.style.setProperty(`--${dasherize(option)}`, value);
				}
			});
		}
	}

	/**
	 * Reset theme to stored values
	 */
	@action resetTheme() {
		this.applyTheme(this.settings.theme);
	}

	/**
	 * Update a specific theme property
	 * @param {String} property - The property to update
	 * @param {String} value - The new value
	 * @returns {Promise<boolean>} True if property was updated, false otherwise
	 */
	@action async updateProperty(property, value) {
		const isValidProperty = themeableOptions.includes(property);
		const hasDocument = typeof document !== "undefined" && document?.documentElement;
		let wasUpdated = false;

		if (isValidProperty) {
			this.settings.theme[property] = value;
			await this.settings.theme.save();

			if (hasDocument) {
				document.documentElement.style.setProperty(`--${dasherize(property)}`, value);
			}

			wasUpdated = true;
		}

		return wasUpdated;
	}
}
