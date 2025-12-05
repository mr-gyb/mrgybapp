# Google Sign In Setup Guide

## 🔍 Error: `auth/operation-not-allowed`

This error means **Google Sign In is not enabled** in your Firebase Console. Follow these steps to enable it.

## 📋 Prerequisites

1. **Firebase Project** configured
2. **Google Cloud Project** (usually same as Firebase project)

## 🚀 Step-by-Step Setup

### Step 1: Enable Google Sign In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Find **Google** in the list of providers
5. Click on **Google** to open settings
6. Toggle **Enable** to ON
7. **Project support email**: Enter your email address (required)
8. Click **Save**

**That's it!** Firebase will automatically configure the OAuth client for you.

### Step 2: Configure Authorized Domains (Optional but Recommended)

1. In Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add your domains:
   - `localhost` (for development - usually already added)
   - `yourdomain.com` (for production)
   - Any other domains you use

### Step 3: Test Google Sign In

1. Restart your development server (if running)
2. Try signing in with Google
3. You should see the Google Sign In popup

## 🔧 Advanced Configuration (Optional)

If you need to use a custom OAuth client (not recommended for most cases):

### Option A: Use Firebase Auto-Generated Client (Recommended)

Firebase automatically creates and manages the OAuth client for you. This is the easiest option and works for most use cases.

### Option B: Use Your Own OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (same as Firebase project)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure:
   - **Application type**: Web application
   - **Name**: Your app name
   - **Authorized JavaScript origins**:
     - `http://localhost:3002` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3002/__/auth/handler` (development)
     - `https://yourdomain.com/__/auth/handler` (production)
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**
8. Go back to Firebase Console → **Authentication** → **Sign-in method** → **Google**
9. Paste the **Client ID** and **Client Secret**
10. Click **Save**

## 🔧 Troubleshooting

### Error: "Invalid client"
- Make sure Google Sign In is enabled in Firebase Console
- Verify the OAuth client is properly configured in Google Cloud Console (if using custom client)

### Error: "Redirect URI mismatch"
- Check that your authorized redirect URIs in Google Cloud Console match exactly:
  - Format: `https://yourdomain.com/__/auth/handler`
  - Must include the `/__/auth/handler` path
- Make sure your domain is added to Firebase authorized domains

### Error: "Popup blocked"
- Allow popups for your site in browser settings
- Try using a different browser
- Check if any browser extensions are blocking popups

### Error: "Network error"
- Check your internet connection
- Verify Firebase project is active
- Check browser console for detailed error messages

## 📝 Important Notes

1. **No Google Cloud Setup Required**: For most cases, Firebase auto-generates the OAuth client. You don't need to manually create one in Google Cloud Console.

2. **Project Support Email**: This is required when enabling Google Sign In. It's used for OAuth consent screen.

3. **Authorized Domains**: Make sure your production domain is added to Firebase authorized domains.

4. **Development**: `localhost` is automatically authorized for development.

5. **OAuth Consent Screen**: If you see a consent screen warning, you may need to configure the OAuth consent screen in Google Cloud Console:
   - Go to **APIs & Services** → **OAuth consent screen**
   - Fill in required information (app name, support email, etc.)
   - For development, you can add test users

## 🔗 Useful Links

- [Firebase Google Sign In Documentation](https://firebase.google.com/docs/auth/web/google-signin)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)

## ✅ Quick Checklist

- [ ] Google Sign In enabled in Firebase Console
- [ ] Project support email configured
- [ ] Authorized domains added (for production)
- [ ] Tested sign in flow
- [ ] OAuth consent screen configured (if needed)

## 🆘 Still Having Issues?

If you're still getting errors after following these steps:

1. **Check Firebase Console logs** for more detailed error messages
2. **Verify Google Sign In is enabled** in Firebase Console → Authentication → Sign-in method
3. **Clear browser cache** and try again
4. **Check browser console** for additional error details
5. **Ensure you're using HTTPS** in production (required for OAuth)
6. **Try incognito/private browsing mode** to rule out browser extension issues

## 🎯 Quick Fix (Most Common Issue)

The most common issue is simply that Google Sign In is not enabled. To fix:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Sign-in method**
4. Click **Google**
5. Toggle **Enable** to ON
6. Enter your **Project support email**
7. Click **Save**
8. Try signing in again

That's usually all you need!

