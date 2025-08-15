# Instagram Integration Environment Setup

To use the Instagram integration feature, you need to set up environment variables in your `.env` file.

## Required Environment Variables

**Instagram integration uses the same Facebook app credentials.** Create or update your `.env` file in the project root with these variables:

```env
# Facebook App Configuration (used for both Facebook and Instagram)
# Get these from https://developers.facebook.com/
VITE_FACEBOOK_APP_ID=your_facebook_app_id_here
VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret_here
```

## How to Get App Credentials

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add **Instagram Basic Display** product to your app
4. Go to **Settings > Basic** to get your **App ID** and **App Secret**
5. Configure your **Valid OAuth Redirect URIs** (e.g., `http://localhost:5174/instagram-callback`)
6. **Note**: Instagram integration uses the same Facebook app credentials

## Example .env File

```env
# Facebook App Configuration (used for both Facebook and Instagram)
VITE_FACEBOOK_APP_ID=1254798369715819
VITE_FACEBOOK_APP_SECRET=b93c1ffc52f7dba128238f4ca5067db3

# Other existing variables
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_SEARCH_PROVIDER=bing
VITE_BING_API_KEY=your_bing_api_key_here
```

## Important Notes

- **Never commit your .env file** to version control
- **Restart your development server** after adding environment variables
- **Instagram Basic Display API** only allows reading data (no posting)
- **For posting capabilities**, you need Instagram Graph API (Business accounts only)
- **Valid OAuth Redirect URIs** must be configured in Facebook Developer Console
- **App must be in "Live" mode** for public users to connect

## Testing the Integration

After setting up the environment variables:

1. Go to **Content Creation → Social Media**
2. Click on the **Instagram** icon
3. Click "Connect Instagram"
4. Complete the OAuth flow using your Facebook app credentials
5. You should see "Connected as @username"

**Note**: Since Instagram integration uses Facebook app credentials, make sure your Facebook app has Instagram Basic Display product enabled.

## Instagram API Limitations

- **Basic Display API**: Read-only access to profile and media
- **Graph API**: Full access including posting (Business accounts only)
- **Current Implementation**: Uses Basic Display API for authentication and profile access
- **Future Enhancement**: Can be upgraded to Graph API for posting capabilities

## Troubleshooting

If you see configuration errors:
- Check that your `.env` file exists in the project root
- Verify the variable names are exactly as shown above
- Restart your development server
- Check the browser console for detailed error messages
- Ensure your Instagram app is properly configured in Facebook Developer Console

## Security Notes

- Instagram App Secret is sensitive information
- Keep your `.env` file secure and never share it
- Use environment variables for all sensitive configuration
- Consider using different app credentials for development and production
