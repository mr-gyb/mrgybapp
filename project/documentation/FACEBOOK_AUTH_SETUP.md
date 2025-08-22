# Facebook Authentication Setup Guide

This guide will help you set up Facebook OAuth authentication for your GYB Studio application.

## Prerequisites

1. **Facebook Developer Account** - You need a Facebook developer account
2. **Firebase Project** - Your Firebase project should be configured
3. **Domain Verification** - Your domain needs to be verified with Facebook

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" as the app type
4. Fill in your app details:
   - **App Name**: GYB Studio
   - **App Contact Email**: Your email
   - **Business Account**: Select if applicable

## Step 2: Configure Facebook Login

1. In your Facebook app dashboard, go to "Products" → "Facebook Login"
2. Click "Set Up" on Facebook Login
3. Choose "Web" as your platform
4. Enter your site URL: `https://yourdomain.com` (or `https://localhost:3000` for development)
5. Save changes

## Step 3: Configure OAuth Settings

1. In Facebook Login settings, go to "Settings" tab
2. Add your domain to "Valid OAuth Redirect URIs":
   - `https://yourdomain.com/__/auth/handler`
   - `https://localhost:3000/__/auth/handler` (for development)
3. Save changes

## Step 4: Get App Credentials

1. Go to "Settings" → "Basic" in your Facebook app
2. Note down:
   - **App ID**
   - **App Secret** (keep this secure)

## Step 5: Configure Firebase

1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to "Authentication" → "Sign-in method"
4. Enable "Facebook" provider
5. Enter your Facebook App ID and App Secret
6. Save

## Step 6: Environment Variables

Create or update your `.env` file with:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Facebook Configuration (Optional - for additional features)
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

## Step 7: Test the Integration

1. Start your development server
2. Navigate to `/auth` or use the Facebook login button
3. Click "Continue with Facebook"
4. You should be redirected to Facebook for authentication
5. After successful authentication, you'll be redirected back to your app

## Step 8: Production Deployment

1. **Domain Verification**: Verify your production domain with Facebook
2. **SSL Certificate**: Ensure your production site uses HTTPS
3. **Privacy Policy**: Facebook requires a privacy policy for production apps
4. **App Review**: For public use, submit your app for Facebook review

## Troubleshooting

### Common Issues

1. **"Invalid OAuth redirect URI"**
   - Ensure your domain is added to Facebook app settings
   - Check that redirect URIs match exactly

2. **"App not configured for Facebook Login"**
   - Verify Facebook Login is enabled in your app
   - Check that you've completed the setup wizard

3. **"Domain not verified"**
   - Verify your domain with Facebook
   - Add domain verification meta tag to your HTML

4. **Firebase configuration errors**
   - Ensure Facebook provider is enabled in Firebase
   - Check that App ID and Secret are correct

### Development vs Production

- **Development**: Use `https://localhost:3000` in Facebook app settings
- **Production**: Use your actual domain with HTTPS
- **Testing**: Facebook requires HTTPS for production domains

## Security Considerations

1. **App Secret**: Never expose your Facebook App Secret in client-side code
2. **Domain Restrictions**: Only allow authentication from verified domains
3. **User Permissions**: Request only necessary permissions from users
4. **Data Validation**: Always validate user data received from Facebook

## Additional Features

Once basic authentication is working, you can:

1. **Profile Data**: Access user's Facebook profile information
2. **Friends List**: Request access to user's friends (requires review)
3. **Pages**: Manage Facebook pages if user grants permission
4. **Analytics**: Track authentication metrics and user engagement

## Support

If you encounter issues:

1. Check Facebook Developer documentation
2. Verify Firebase configuration
3. Review browser console for error messages
4. Ensure all environment variables are set correctly

## Next Steps

After successful Facebook authentication setup:

1. **User Profile**: Enhance user profiles with Facebook data
2. **Social Features**: Add social sharing and friend connections
3. **Analytics**: Track user engagement and authentication patterns
4. **Multi-Platform**: Add other OAuth providers (Google, Twitter, etc.)
