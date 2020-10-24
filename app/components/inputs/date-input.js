import Component from "@glimmer/component";
import {action} from "@ember/object";

export default class InputsDateInputComponent extends Component {
	@action onChange([date]) {
		this.args.onChange(date);
		this.args.onClose(...arguments);
	}
}
