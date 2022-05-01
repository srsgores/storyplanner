import Component from "@glimmer/component";
import {action} from "@ember/object";
import {tracked} from "@glimmer/tracking";

export default class FormsUserAuthenticationComponent extends Component {
	@tracked email;
	@tracked password;
	@action onSubmit(submitEvent) {
		submitEvent.preventDefault();
		if (this.args.onSubmit) {
			return this.args.onSubmit(this.username, this.password);
		}
	}
}
