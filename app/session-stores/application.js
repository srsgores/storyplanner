import CookieStore from "ember-simple-auth/session-stores/cookie";

export default class ApplicationSessionStore extends CookieStore {
	cookieName = "storyplanner_session";
	// Default cookie expiration is 1 day
	cookieExpirationTime = 60 * 60 * 24 * 1000;
}
