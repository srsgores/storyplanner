import Controller from "@ember/controller";
import {inject as service} from "@ember/service";
import {action} from "@ember/object";
import {signInWithEmailAndPassword} from "ember-cloud-firestore-adapter/firebase/auth";

export default class LoginController extends Controller {
	@service session;

	@action login(username, password) {
		return this.session.authenticate("authenticator:firebase", function(firebaseAuthenticator) {
			return signInWithEmailAndPassword(firebaseAuthenticator, username, password);
		});
	}
}
