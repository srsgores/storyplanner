/**
 * Netlify Identity Initializer
 *
 * This initializer loads the Netlify Identity widget and registers it globally
 * for authentication use with the sync functionality.
 */
export function initialize(/* application */) {
	// Load Netlify Identity Widget script
	if (typeof window !== "undefined") {
		const script = document.createElement("script");
		script.src = "https://identity.netlify.com/v1/netlify-identity-widget.js";
		script.async = true;
		script.defer = true;
		script.onload = () => {
			if (window.netlifyIdentity) {
				// Initialize widget with your Netlify site URL
				window.netlifyIdentity.init({
					locale: "en",
					APIUrl: `https://${process.env.NETLIFY_SITE_ID || "localhost"}.netlify.app/.netlify/identity`
				});
			}
		};
		document.head.appendChild(script);
	}
}

export default {
	name: "netlify-identity",
	initialize
};
