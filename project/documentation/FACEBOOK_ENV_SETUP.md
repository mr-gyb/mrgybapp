# Facebook Integration Environment Setup

To use the Facebook integration feature, you need to set up environment variables in your `.env` file.

## Required Environment Variables

Create or update your `.env` file in the project root with these variables:

```env
# Facebook App Configuration
# Get these from https://developers.facebook.com/
VITE_FACEBOOK_APP_ID=your_facebook_app_id_here
VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret_here
```

## How to Get Facebook App Credentials

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Go to **Settings > Basic**
4. Copy your **App ID** and **App Secret**
5. Add these to your `.env` file

## Example .env File

```env
# Facebook Integration
VITE_FACEBOOK_APP_ID=123456789012345
VITE_FACEBOOK_APP_SECRET=abcdef123456789abcdef123456789ab

# Other existing variables
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_SEARCH_PROVIDER=bing
VITE_BING_API_KEY=your_bing_api_key_here
VITE_GOOGLE_API_KEY=your_google_api_key_here
VITE_GOOGLE_SEARCH_ENGINE_ID=your_google_search_engine_id_here
```

## Important Notes

- **Never commit your .env file** to version control
- **Restart your development server** after adding environment variables
- The Facebook App must be configured with proper OAuth redirect URIs
- Make sure your app domain is configured in Facebook Developer Console

## Testing the Integration

After setting up the environment variables:

1. Go to **Settings → Manage Integration → Facebook Login**
2. Click "Connect Facebook"
3. Complete the OAuth flow
4. Create and upload posts directly to Facebook

## Troubleshooting

If you see configuration errors:
- Check that your `.env` file exists in the project root
- Verify the variable names are exactly as shown above
- Restart your development server
- Check the browser console for detailed error messages
