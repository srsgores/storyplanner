import Base from "ember-simple-auth/authenticators/base";
import {inject as service} from "@ember/service";
import {resolve, reject} from "rsvp";

export default class NetlifyAuthenticator extends Base {
	@service router;

	async restore(data) {
		if (!data || !data.user) {
			return reject("No valid session data");
		}

		// Check if Netlify Identity is available
		const netlifyIdentity = window.netlifyIdentity;
		if (!netlifyIdentity) {
			return reject("Netlify Identity not available");
		}

		// If user exists in Netlify Identity, use that
		const currentUser = netlifyIdentity.currentUser();
		if (currentUser) {
			return resolve({
				user: currentUser,
				token: currentUser.token?.access_token
			});
		}

		// Attempt to use stored credentials
		try {
			// Use the stored user information
			return resolve({
				user: data.user,
				token: data.token
			});
		} catch (error) {
			return reject(error);
		}
	}

	async authenticate() {
		const netlifyIdentity = window.netlifyIdentity;
		if (!netlifyIdentity) {
			return reject("Netlify Identity not available");
		}

		return new Promise((resolve, reject) => {
			const successCallback = user => {
				netlifyIdentity.off("login", successCallback);
				netlifyIdentity.off("error", errorCallback);

				if (user) {
					resolve({
						user,
						token: user.token?.access_token
					});
				} else {
					reject("No user returned from Netlify Identity");
				}
			};

			const errorCallback = error => {
				netlifyIdentity.off("login", successCallback);
				netlifyIdentity.off("error", errorCallback);
				reject(error);
			};

			// Set up event listeners
			netlifyIdentity.on("login", successCallback);
			netlifyIdentity.on("error", errorCallback);

			// Open login modal
			netlifyIdentity.open("login");
		});
	}

	async invalidate() {
		const netlifyIdentity = window.netlifyIdentity;
		if (!netlifyIdentity) {
			return resolve();
		}

		return new Promise(resolve => {
			const logoutCallback = () => {
				netlifyIdentity.off("logout", logoutCallback);
				resolve();
			};

			netlifyIdentity.on("logout", logoutCallback);
			netlifyIdentity.logout();
		});
	}
}
