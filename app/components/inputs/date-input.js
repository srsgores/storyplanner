import Component from "@glimmer/component";
import {action} from "@ember/object";

export default class InputsDateInputComponent extends Component {
	@action onChange([date]) {
		this.args.onChange(date);
		if (this.args.onClose) {
			this.args.onClose(...arguments);
		}
	}
}
