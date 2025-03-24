import Component from "@glimmer/component";
import {tracked} from "@glimmer/tracking";
import {guidFor} from "@ember/object/internals";
import {action, set} from "@ember/object";
import {debounce, run} from "@ember/runloop";
import {inject as service} from "@ember/service";
import {isEmpty} from "@ember/utils";
import Range from "mobiledoc-kit/utils/cursor/range";

export default class AutocompleteComponent extends Component {
	elementId = guidFor(this);
	@tracked options = [];
	@tracked selectedOptionIndex = 0;
	@tracked isLoading = false;
	@service store;
	@tracked openRange;

	get selectedOption() {
		return this.options[this.selectedOptionIndex];
	}

	updateMatchResults() {
		const queryString = this.openRange.head.section.text.substring(this.openRange.head.offset, this.args.editor.range.head.offset);
		const query = isEmpty(queryString) ? {} : {filter: {name: new RegExp(queryString)}};
		this.store
			.query(this.args.modelName, query)
			.then(matches => {
				this.options = matches.map((model, index) => {
					return {
						model,
						index,
						name: model.title || model.name,
						isSelected: false
					};
				});
			})
			.finally(() => {
				this.isLoading = false;
			});
	}

	constructor() {
		super(...arguments);
		this.registerKeyboardHandlers();
		this.openRange = this.args.editor.range;
		this.args.editor.onTextInput({
			name: "autocomplete-menu",
			match: /(\w)/,
			run: () => {
				this.fetchMatches();
			}
		});
		this.fetchMatches();
	}

	willDestroy() {
		super.willDestroy();
		this.unregisterKeyboardHandlers();
	}

	registerKeyboardHandlers() {
		const {editor} = this.args;
		if (editor) {
			editor.registerKeyCommand({
				str: "ESC",
				name: "autocomplete-menu",
				run: () => {
					if (this.args.onClose) {
						return this.args.onClose();
					}
				}
			});

			editor.registerKeyCommand({
				str: "ENTER",
				name: "autocomplete-menu",
				run: run.bind(this, this.selectOption)
			});

			editor.registerKeyCommand({
				str: "UP",
				name: "autocomplete-menu",
				run: run.bind(this, this.moveSelection, "UP")
			});

			editor.registerKeyCommand({
				str: "DOWN",
				name: "autocomplete-menu",
				run: run.bind(this, this.moveSelection, "DOWN")
			});

			editor.registerKeyCommand({
				str: "LEFT",
				name: "autocomplete-menu",
				run: run.bind(this, this.moveSelection, "LEFT")
			});

			editor.registerKeyCommand({
				str: "RIGHT",
				name: "autocomplete-menu",
				run: run.bind(this, this.moveSelection, "RIGHT")
			});
		}
	}

	unregisterKeyboardHandlers() {
		this.args.editor.unregisterKeyCommands("autocomplete-menu");
	}

	@action fetchMatches() {
		this.isLoading = true;
		debounce(this, "updateMatchResults", 300);
	}

	@action selectOption() {
		if (this.selectedOption && this.selectedOption.model) {
			let {model} = this.selectedOption;
			const rangeToRemove = new Range(this.openRange.head, this.args.editor.range.tail).extend(-1);
			this.args.editor.deleteRange(rangeToRemove);
			if (this.args.onSelectOption) {
				this.args.onSelectOption(model);
			}
			set(this.selectedOption, "isSelected", false);
			this.selectedOptionIndex = 0;
		}
	}

	@action focusOption(option) {
		if (this.selectedOption) {
			set(this.selectedOption, "isSelected", false);
		}
		this.selectedOptionIndex = option.index;
		set(this.selectedOption, "isSelected", true);
	}

	@action moveSelection(direction) {
		const selectedOption = this.selectedOption || this.options[0];
		if (direction === "UP" || direction === "LEFT") {
			if (selectedOption === this.options[0]) {
				this.focusOption(this.options[this.options.length - 1]);
			} else {
				this.focusOption(this.options[selectedOption.index - 1]);
			}
		} else if (direction === "DOWN" || direction === "RIGHT") {
			if (selectedOption === this.options[this.options.length - 1]) {
				this.focusOption(this.options[0]);
			} else {
				this.focusOption(this.options[selectedOption.index + 1]);
			}
		}
	}
}
