import Component from "@glimmer/component";
import {inject as service} from "@ember/service";
import {action} from "@ember/object";
import {dasherize} from "@ember/string";
import {get} from "@ember/object";
import {themeableOptions} from "../models/theme";
import {htmlSafe} from "@ember/template";

export default class ThemeProviderComponent extends Component {
	@service("theme-provider") themeProvider;
	@service settings;

	constructor() {
		super(...arguments);
		this._applyTheme();
	}

	/**
	 * Apply the theme from settings
	 * @returns {Promise<void>}
	 */
	@action
	async _applyTheme() {
		const theme = await this._waitForTheme();
		this.themeProvider.applyTheme(theme);
	}

	/**
	 * Waits for theme to be available
	 * @returns {Promise<Object>} The theme object
	 */
	async _waitForTheme() {
		const isThemeAvailable = !!this.settings.theme;
		let themeObject = null;

		if (isThemeAvailable) {
			themeObject = this.settings.theme;
		} else {
			themeObject = await new Promise(resolve => {
				const checkInterval = setInterval(() => {
					if (this.settings.theme) {
						clearInterval(checkInterval);
						resolve(this.settings.theme);
					}
				}, 100);
			});
		}

		return themeObject;
	}

	/**
	 * Generate CSS custom properties from theme settings
	 * @returns {SafeString} HTML-safe CSS string
	 */
	get customStyles() {
		let styles = "";

		if (this.settings.theme) {
			themeableOptions.forEach(themeSetting => {
				const customProperty = `--${dasherize(themeSetting)}`;
				const value = get(this.settings.theme, themeSetting);

				if (value) {
					styles += `${customProperty}: ${value};\n`;
				}
			});
		}

		return htmlSafe(styles);
	}
}
