import MobileDocEditorComponent from "ember-mobiledoc-editor/components/mobiledoc-editor/component";
import {action} from "@ember/object";
import {debounce, run} from "@ember/runloop";
import {utils as ghostHelperUtils} from "@tryghost/helpers";
import {tracked} from "@glimmer/tracking";
import createComponentCard from "ember-mobiledoc-editor/utils/create-component-card";
const {countWords} = ghostHelperUtils;

export const SUPPORTED_CARDS = ["divider"];

export default class ContentEditorComponent extends MobileDocEditorComponent {
	@tracked autocompleteText;
	@tracked showAutocomplete = false;
	@tracked modelName = "character";
	@tracked previousCursorPosition;

	constructor() {
		super(...arguments);
		this.cards = SUPPORTED_CARDS.map((cardName) => createComponentCard(cardName));
	}
	get autocompletePrompt() {
		return `Search for ${this.modelName}s`;
	}

	@action setupEditorShortcuts(editor) {
		editor.onTextInput({
			name: "blockquote",
			match: /^> /,
			run(editor, matches) {
				let {range} = editor;
				const {head, head: {section}} = range;
				const text = section.textUntil(head);

				// ensure cursor is at the end of the matched text so we don't convert text the users wants to start with `> ` and that we're not already on a blockquote section
				if (text === matches[0] && section.tagName !== "blockquote") {
					editor.run((postEditor) => {
						range = range.extend(-(matches[0].length));
						const position = postEditor.deleteRange(range);
						postEditor.setRange(position);

						postEditor.toggleSection("blockquote");
					});
				}
			}
		});

		// borrowed from https://github.com/bustle/mobiledoc-kit/blob/master/src/js/editor/text-input-handlers.ts#L84
		editor.onTextInput({
			match: /^(#{1,6}) $/,
			name: "heading",
			run(editor, matches) {
				const capture = matches[1];
				const headingTag = "h" + capture.length;
				editor.replaceWithHeaderSection(editor, headingTag);
			}
		});

		editor.onTextInput({
			name: "md_hr",
			match: /^---$/,
			run: (postEditor) => {
				const {range: {head, head: {section}}} = postEditor;
				const payload = {};

				// Skip if cursor is not at end of section
				if (head.isTail() && !section.isListItem) {
					this.replaceWithCardSection("divider", section.toRange(), payload);
				}
			}
		});
	}

	@action setupCharacterMentions(editor) {
		editor.onTextInput({
			text: "@",
			name: "characters",
			run: (editorInstance) => {
				console.log(editorInstance.range.head);
				this.showAutocomplete = true;
				this.modelName = "character";
				this.previousCursorPosiiton = editorInstance.position;
			}
		});
	}

	@action replaceWithCardSection(cardName, range, payload) {
		const editor = this.editor;
		const {head: {section}} = range;

		editor.run((postEditor) => {
			const {builder} = postEditor;
			const card = builder.createCardSection(cardName, payload);
			const nextSection = section.next;
			const needsTrailingParagraph = !nextSection;

			postEditor.replaceSection(section, card);

			// add an empty paragraph after if necessary so writing can continue
			if (needsTrailingParagraph) {
				const newSection = postEditor.builder.createMarkupSection("p");
				postEditor.insertSectionAtEnd(newSection);
				postEditor.setRange(newSection.tailPosition());
			}
			else {
				postEditor.setRange(nextSection.headPosition());
			}
		});
	}

	didCreateEditor(editor) {
		this.setupEditorShortcuts(editor);
		this.setupCharacterMentions(editor);
		super.didCreateEditor(...arguments);
	}

	updateWordCount(editor) {
		let wordCount = 0;
		editor.post.walkAllLeafSections((section) => {
			wordCount += countWords(section.text);
		});
		return this.onWordCountChange(wordCount);
	}

	postDidChange(editor) {
		if (this.onWordCountChange) {
			debounce(this, "updateWordCount", editor, 500);
		}
		super.postDidChange(...arguments);
	}
}
