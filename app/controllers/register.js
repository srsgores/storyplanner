import Controller from "@ember/controller";
import {inject as service} from "@ember/service";
import {action} from "@ember/object";

export default class RegisterController extends Controller {
	@service session;
	@action register(username, password) {
		return this.session.authenticate("", {username, password});
	}
}
