const {getStore} = require("@netlify/blobs");

exports.handler = async (event, context) => {
	const {identity, user} = context.clientContext;

	// Check if user is authenticated
	if (!user) {
		return {
			statusCode: 401,
			body: JSON.stringify({
				error: "You must be logged in to access this resource"
			})
		};
	}

	try {
		// Get user-specific store
		const userId = user.sub;
		const blobStore = getStore({
			siteID: process.env.NETLIFY_SITE_ID,
			name: `storyplanner-${userId}`
		});

		// Handle different HTTP methods
		switch (event.httpMethod) {
			case "GET":
				return await handleGet(event, blobStore);
			case "POST":
				return await handlePost(event, blobStore);
			default:
				return {
					statusCode: 405,
					body: JSON.stringify({error: "Method not allowed"})
				};
		}
	} catch (error) {
		console.error("Sync error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({error: "Internal server error"})
		};
	}
};

// Handle GET requests - retrieve data from blob store
async function handleGet(event, blobStore) {
	const {key} = event.queryStringParameters || {};

	if (!key) {
		return {
			statusCode: 400,
			body: JSON.stringify({error: "Key parameter is required"})
		};
	}

	try {
		const data = await blobStore.get(key);

		return {
			statusCode: 200,
			body: JSON.stringify({data})
		};
	} catch (error) {
		return {
			statusCode: 404,
			body: JSON.stringify({error: "Resource not found"})
		};
	}
}

// Handle POST requests - store data in blob store
async function handlePost(event, blobStore) {
	try {
		const {key, data} = JSON.parse(event.body);

		if (!key || !data) {
			return {
				statusCode: 400,
				body: JSON.stringify({error: "Key and data are required"})
			};
		}

		await blobStore.set(key, data);

		return {
			statusCode: 200,
			body: JSON.stringify({success: true})
		};
	} catch (error) {
		return {
			statusCode: 400,
			body: JSON.stringify({error: "Invalid request body"})
		};
	}
}
