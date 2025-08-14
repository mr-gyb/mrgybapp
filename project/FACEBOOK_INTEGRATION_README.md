# Facebook Integration for GYB App

This document describes the Facebook integration feature that allows users to connect their Facebook accounts and upload posts directly from the GYB application.

## Features

- **Facebook Account Connection**: Users can connect their personal Facebook accounts
- **Direct Post Upload**: Create and upload posts directly to Facebook
- **Scheduled Posting**: Schedule posts for optimal engagement times
- **Multi-Format Support**: Support for text, images, links, and rich media
- **Permission Management**: Automatic permission checking and management

## Setup Requirements

### 1. Facebook App Configuration

1. Create a Facebook App in the [Facebook Developer Portal](https://developers.facebook.com/)
2. Configure the following settings:
   - App Type: Consumer
   - Platform: Web
   - Valid OAuth Redirect URIs: Add your app's domain
   - App Domains: Your app's domain

### 2. Firebase Configuration

Ensure your Firebase project has Facebook authentication enabled:

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable Facebook provider
3. Add your Facebook App ID and App Secret
4. Configure OAuth redirect URI

### 3. Environment Variables

Add the following environment variables to your `.env` file:

```env
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## Usage

### 1. Accessing Facebook Integration

1. Navigate to **Settings** → **Manage Integration** → **Facebook Login**
2. Click on the Facebook integration card
3. You'll be redirected to the Facebook integration page

### 2. Connecting Facebook Account

1. Click **"Connect Facebook Account"**
2. Complete Facebook OAuth flow
3. Grant necessary permissions:
   - `publish_actions` - To post to your profile
   - `publish_pages` - To post to pages you manage
   - `email` - For account identification
   - `public_profile` - For basic profile information

### 3. Creating and Uploading Posts

1. Go to the **"Create Post"** tab
2. Write your post message
3. Optionally add:
   - Links
   - Images (via URL)
   - Scheduled posting time
4. Click **"Post Now"** or **"Schedule"**

### 4. Managing Connection

- **View Status**: See connection status and permissions
- **Disconnect**: Remove Facebook account connection
- **Reconnect**: Re-establish connection if needed

## Technical Implementation

### Components

- `FacebookIntegration.tsx` - Main integration page
- `FacebookLogin.tsx` - Account connection component
- `FacebookPostUploader.tsx` - Post creation and upload
- `useFacebookIntegration.ts` - Custom hook for state management

### Services

- `facebook-integration.service.ts` - Core integration logic
- Handles authentication, posting, and account management

### Data Flow

1. User initiates Facebook connection
2. Firebase handles OAuth authentication
3. Facebook access token is obtained
4. Account information is stored locally
5. User can create and upload posts
6. Posts are sent directly to Facebook via Graph API

## Security Considerations

- Access tokens are stored locally (consider Firebase storage for production)
- Permissions are validated before posting
- OAuth flow follows Facebook's security guidelines
- No sensitive data is logged or exposed

## Error Handling

The integration includes comprehensive error handling for:
- Authentication failures
- Permission issues
- Network errors
- Invalid post data
- Facebook API rate limits

## Future Enhancements

- **Analytics Dashboard**: Post performance metrics
- **Bulk Posting**: Upload multiple posts at once
- **Content Templates**: Pre-designed post templates
- **Audience Targeting**: Advanced targeting options
- **Cross-Platform Sync**: Sync with other social platforms

## Troubleshooting

### Common Issues

1. **"Failed to connect Facebook account"**
   - Check Facebook App configuration
   - Verify OAuth redirect URIs
   - Ensure Firebase Facebook auth is enabled

2. **"Insufficient permissions"**
   - Re-authenticate with Facebook
   - Grant required permissions during OAuth
   - Check Facebook App review status

3. **"Post upload failed"**
   - Verify account connection
   - Check post content for policy violations
   - Ensure valid image URLs

### Support

For technical support or questions about the Facebook integration:
- Check Facebook Developer documentation
- Review Firebase authentication setup
- Contact the development team

## API Reference

### Facebook Integration Service

```typescript
interface FacebookAccount {
  id: string;
  name: string;
  accessToken: string;
  permissions: string[];
  isConnected: boolean;
  connectedAt: string;
}

interface FacebookPostData {
  message: string;
  link?: string;
  imageUrl?: string;
  scheduledTime?: string;
  pageId?: string;
}
```

### Key Methods

- `connectFacebookAccount(accessToken)` - Connect Facebook account
- `uploadPost(postData)` - Upload post to Facebook
- `disconnectFacebookAccount()` - Remove connection
- `getConnectedAccount()` - Get current connection status

## License

This integration is part of the GYB application and follows the same licensing terms.
