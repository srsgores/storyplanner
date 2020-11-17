import MobileDocEditorComponent from "ember-mobiledoc-editor/components/mobiledoc-editor/component";
import {action} from "@ember/object";

export default class ContentEditorComponent extends MobileDocEditorComponent {
	@action setupEditorShortcuts(editor) {
		editor.onTextInput({
			text: "> ",
			run(editorInstance) {
				editorInstance.toggleSection("blockquote");
			}
		});
	}
}
