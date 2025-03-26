import Controller from "@ember/controller";
import {inject as service} from "@ember/service";
import {action} from "@ember/action";

export default class RegisterController extends Controller {
	@service session;
	@action register() {
		return this.session.authenticate("authenticator:netlify");
	}
}
