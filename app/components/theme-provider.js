import Component from "@glimmer/component";
import {inject as service} from "@ember/service";
import {dasherize} from "@ember/string";
import {get} from "@ember/object";
import {themeableOptions} from "../storages/theme";
import {htmlSafe} from "@ember/template";

export default class ThemeProviderComponent extends Component {
	@service settings;

	get customStyles() {
		let styles = "";
		themeableOptions.forEach((themeSetting) => {
			const customProperty = `--${dasherize(themeSetting)}`;
			const value = get(this.settings.theme, themeSetting);
			if (value) {
				styles += `${customProperty}: ${value};\n`;
			}
		});
		return htmlSafe(styles);
	}
}
