import Route from "@ember/routing/route";
import {inject as service} from "@ember/service";

export default class RegisterRoute extends Route {
	@service session;

	async beforeModel(transition) {
		return await this.session.prohibitAuthentication("index");
	}
}
