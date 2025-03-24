# StoryPlanner Backend and Sync Implementation

This document outlines the backend API implementation for StoryPlanner using Netlify and Fireproof, along with setup instructions for the sync functionality.

## Technology Stack

-   **Database**: [Fireproof](https://use-fireproof.com/) - A local-first database built on immutable logs that provides CRDT-based synchronization
-   **Backend**: [Netlify](https://www.netlify.com/) - For hosting, serverless functions, and identity management
-   **Storage**: [Netlify Blobs](https://docs.netlify.com/blobs/overview/) - For blob storage
-   **Authentication**: Netlify Identity - For user authentication across devices
-   **Frontend**: Ember.js with custom Fireproof adapter for Ember Data

## Architecture

StoryPlanner uses a local-first architecture with Fireproof as the primary database. This approach provides:

1. Offline functionality - users can work without an internet connection
2. Real-time synchronization - changes sync automatically when online
3. Collaborative editing - multiple users can edit the same document simultaneously

The sync functionality allows users to:

-   Work offline and automatically sync when reconnected
-   Manually trigger synchronization
-   See the current connection and sync status
-   Toggle automatic synchronization
-   Login/logout to enable multi-device synchronization

### Sync Process Flow

The sync process works as follows:

1. Data is saved locally in the Fireproof database
2. When online and authenticated, data is synchronized with Netlify Blobs
3. Other clients can retrieve the data from Netlify Blobs when they sync
4. Conflicts are automatically resolved using Fireproof's CRDT capabilities

### Database Structure

Fireproof stores data in the following format:

-   Each document has a unique ID
-   Documents include a `type` field to identify the model type
-   Relationships are stored in a `relationships` field

### Blob Storage

Large binary data (like images) is stored in Netlify Blobs rather than in the database. The `data-sync` service provides methods for storing and retrieving blobs.

## Prerequisites

Before setting up the sync functionality, you need:

-   Node.js and npm
-   Netlify CLI
-   A Netlify account
-   A deployed Netlify site (or local development environment)
-   Netlify Identity enabled on your site
-   Netlify Blobs set up for your site

## Installation

1. Install required dependencies:

    ```bash
    npm install @fireproof/core @netlify/blobs ember-simple-auth
    ```

2. Link your Netlify site:

    ```bash
    netlify login
    netlify link
    ```

3. Create a `.env` file in your project root with the following variables:

    ```
    # .env file
    NETLIFY_SITE_ID=your-netlify-site-id
    NETLIFY_API_TOKEN=your-netlify-api-token
    ```

## Environment Variables

| Variable            | Description                                        | Example                  |
| ------------------- | -------------------------------------------------- | ------------------------ |
| `NETLIFY_SITE_ID`   | The ID of your Netlify site                        | `my-storyplanner-app`    |
| `NETLIFY_API_TOKEN` | API token for Netlify with appropriate permissions | `abcd1234-token-example` |

To obtain these values:

1. **NETLIFY_SITE_ID**:

    - Go to your Netlify dashboard
    - Select your site
    - The site ID is in the Site settings > Site details > Site information section

2. **NETLIFY_API_TOKEN**:
    - Go to your Netlify user settings (click avatar > User settings)
    - Select Applications
    - Under Personal access tokens, create a new token
    - Give it a description and select the appropriate scopes (at minimum: `sites:read` and `blobs:write`)

## Local Development

Run the development server:

```bash
npm install -g netlify-cli
netlify login
netlify link # Link to your Netlify site
netlify dev  # Run development server with Netlify environment
```

This will start both the Ember.js application and the Netlify Functions locally.

## Using The Sync Component

Add the sync status component to your application:

```handlebars
<SyncStatus />
```

The component will automatically:

-   Display the current connection status
-   Show authentication status and login/logout buttons
-   Display the last sync time
-   Provide options for manual sync and enabling/disabling auto-sync
-   Show error messages when applicable

## Configuration Options

The data-sync service defines several constants that can be adjusted:

-   `RECONNECT_INTERVAL` (default: 5000ms) - Time to wait before reconnecting after going offline
-   `AUTO_SYNC_INTERVAL` (default: 60000ms) - Interval for automatic sync when enabled
-   `SYNC_DEBOUNCE` (default: 2000ms) - Debounce period for rapid sync requests

## Key Components

The sync implementation consists of several key components:

1. **data-sync.js** - Core service that handles synchronization logic
2. **fireproof.js** - Ember Data adapter for Fireproof
3. **netlify.js** - Authenticator for Netlify Identity
4. **sync-status** - UI component for displaying sync state

### Serverless Functions

Netlify Functions are used for server-side operations:

-   **sync.js**: Handles data synchronization between clients

## Troubleshooting

### Common Issues:

1. **Authentication Errors**:

    - Ensure Netlify Identity is properly configured
    - Check that the Netlify Identity widget is loaded
    - Verify your user has appropriate permissions

2. **Sync Failures**:

    - Check your internet connection
    - Verify your environment variables are correct
    - Look for console errors related to Fireproof or Netlify Blobs

3. **Missing Blob Data**:
    - Ensure your Netlify API token has the correct permissions
    - Verify the blob store name matches in both client and server code

## Best Practices

1. Always handle potential offline states in your application
2. Use the `dataSync` service for all blob storage operations
3. Allow automatic sync for the best user experience
4. Display the sync status component prominently so users understand the sync state
5. Implement proper error handling for sync failures

## Deployment

To deploy the application:

```bash
npm run build
netlify deploy --prod
```

This will build the Ember.js application and deploy it along with the serverless functions to Netlify.
