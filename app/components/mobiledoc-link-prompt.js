import Component from "@glimmer/component";
import {tracked} from "@glimmer/tracking";
import {guidFor} from "@ember/object/internals";

export default class MobiledocLinkPromptComponent extends Component {
	elementId = guidFor(this);
	@tracked url;
}
