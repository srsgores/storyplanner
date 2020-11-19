import MobileDocEditorComponent from "ember-mobiledoc-editor/components/mobiledoc-editor/component";
import {action} from "@ember/object";
import {run, debounce} from "@ember/runloop";
import {utils as ghostHelperUtils} from "@tryghost/helpers";

const {countWords} = ghostHelperUtils;

export default class ContentEditorComponent extends MobileDocEditorComponent {

	@action setupEditorShortcuts(editor) {
		editor.onTextInput({
			text: "> ",
			name: "content-editor",
			run(editorInstance) {
				run.next(this, function() {
					editorInstance.toggleSection("blockquote");
				});
			}
		});
	}

	didCreateEditor(editor) {
		this.setupEditorShortcuts(editor);
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
