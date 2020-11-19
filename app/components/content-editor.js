import MobileDocEditorComponent from "ember-mobiledoc-editor/components/mobiledoc-editor/component";
import {action} from "@ember/object";
import {run} from "@ember/runloop";

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
	}
}
