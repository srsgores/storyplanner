import Controller from "@ember/controller";
import {inject as service} from "@ember/service";
import {action} from "@ember/action";

export default class LoginController extends Controller {
	@service session;
	@action login() {
		return this.session.authenticate("authenticator:netlify");
	}
}
