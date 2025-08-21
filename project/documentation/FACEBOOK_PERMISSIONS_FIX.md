# Facebook Permissions Fix

## Problem
Your Facebook integration was failing with the error:
```
Invalid Scopes: pages_show_list, pages_read_engagement, pages_manage_metadata
```

## Root Cause
The permissions `pages_show_list` and `pages_manage_metadata` are **invalid/deprecated** according to Facebook's current API documentation. These permissions no longer exist or have been replaced.

## Solution Applied
I've updated your codebase to use the **correct, currently valid Facebook permissions**:

### Old (Invalid) Permissions:
- ❌ `pages_show_list` - No longer exists
- ❌ `pages_manage_metadata` - No longer exists  
- ❌ `pages_read_engagement` - Still valid but was being used incorrectly

### New (Valid) Permissions:
- ✅ `email` - User's email address
- ✅ `public_profile` - Basic profile information
- ✅ `pages_manage_posts` - Post to pages the user manages
- ✅ `pages_read_engagement` - Read page insights and engagement data

## Files Updated
1. **`src/services/facebookIntegration.service.ts`** - Main Facebook login scopes
2. **`src/utils/integrationAuth.ts`** - OAuth URL generation
3. **`src/components/FacebookMetricsVerifier.tsx`** - UI component
4. **`src/components/FacebookMetricsVerifier-DESKTOP-D4B599Q.tsx`** - Desktop version
5. **`facebook-api-documentation.md`** - Documentation
6. **`facebook-api-examples.json`** - Example configurations

## What You Need to Do

### 1. Update Your Facebook App Settings
Go to [Facebook Developers Console](https://developers.facebook.com/) and:

1. **Navigate to your app** → **App Review** → **Permissions and Features**
2. **Remove any invalid permissions** if they exist
3. **Add the correct permissions**:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `email`
   - `public_profile`

### 2. Test the Integration
1. **Clear your browser's Facebook login cache** (logout from Facebook in your app)
2. **Try connecting again** - the error should be resolved
3. **Verify permissions** are granted correctly

### 3. Environment Variables
Ensure your `.env` file has:
```env
VITE_FACEBOOK_APP_ID=your_app_id_here
VITE_FACEBOOK_APP_SECRET=your_app_secret_here
```

## Current Valid Facebook Permissions
According to Facebook's latest documentation, these are the main permissions you can use:

### Basic Permissions:
- `email` - User's email
- `public_profile` - Basic profile info

### Page Management:
- `pages_manage_posts` - Post to pages
- `pages_read_engagement` - Read page insights
- `pages_show_list` - List user's pages (if still needed)

### Content Management:
- `publish_actions` - Post to user's timeline (deprecated, use pages_manage_posts instead)

## Testing
After making these changes:
1. **Restart your development server**
2. **Clear browser cache/cookies for Facebook**
3. **Try the Facebook login again**
4. **Check the browser console** for any remaining permission errors

## Additional Notes
- Facebook frequently updates their API and permissions
- Always refer to the [official Facebook permissions documentation](https://developers.facebook.com/docs/facebook-login/permissions)
- The `pages_manage_posts` permission requires Facebook App Review approval for production use
- Test thoroughly in development mode before deploying to production

## Support
If you continue to face issues:
1. Check Facebook's [App Review status](https://developers.facebook.com/apps/)
2. Verify your app is in the correct mode (Development/Production)
3. Ensure all required permissions are approved in App Review
