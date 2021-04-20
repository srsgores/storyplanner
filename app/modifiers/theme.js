import {modifier} from "ember-modifier";
import {dasherize} from "@ember/string";
import {get} from "@ember/object";
import {themeableOptions} from "../storages/theme";

export default modifier(function theme(element, [settings]) {
	if (settings?.theme) {
		themeableOptions.forEach(function(themeSetting) {
			const customProperty = `--${dasherize(themeSetting)}`;
			const value = get(settings.theme, themeSetting);
			if (value) {
				element.style.setProperty(customProperty, value);
			}
		});
	}
});
