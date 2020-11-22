import MobileDocEditorComponent from "ember-mobiledoc-editor/components/mobiledoc-editor/component";
import {action} from "@ember/object";
import {debounce} from "@ember/runloop";
import {utils as ghostHelperUtils} from "@tryghost/helpers";
import {tracked} from "@glimmer/tracking";

const {countWords} = ghostHelperUtils;

export default class ContentEditorComponent extends MobileDocEditorComponent {
	@tracked autocompleteText;
	@tracked showAutocomplete = false;
	@tracked modelName = "character";
	@tracked previousCursorPosition;

	get autocompletePrompt() {
		return `Search for ${this.modelName}s`;
	}

	@action setupEditorShortcuts(editor) {
		editor.onTextInput({
			name: "content-editor",
			match: /^> /,
			run(editor, matches) {
				let {range} = editor;
				let {head, head: {section}} = range;
				let text = section.textUntil(head);

				// ensure cursor is at the end of the matched text so we don't convert text the users wants to start with `> ` and that we're not already on a blockquote section
				if (text === matches[0] && section.tagName !== "blockquote") {
					editor.run((postEditor) => {
						range = range.extend(-(matches[0].length));
						let position = postEditor.deleteRange(range);
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
