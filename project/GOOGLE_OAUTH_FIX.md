# Google OAuth "Unable to verify client" Error Fix

## 🔍 Error Explanation

The error `{"error":"invalid_request","error_description":"Unable to verify client."}` means:
- Google OAuth client ID is missing, invalid, or not configured correctly
- Redirect URI doesn't match what's registered in Google Cloud Console
- OAuth client credentials are incorrect

## 🔧 Quick Fixes

### Option 1: Check Environment Variables

Make sure you have `VITE_GOOGLE_CLIENT_ID` set in your `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Option 2: Configure Google OAuth in Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** (or create one)
3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - **Authorized redirect URIs**: Add:
     - `http://localhost:3003/__/auth/handler` (for development)
     - `http://localhost:3003/settings/integrations/callback` (for integrations)
     - Your production domain URLs
5. **Copy the Client ID** and add it to your `.env` file

### Option 3: Disable Google OAuth (If Not Needed)

If you're not using Google OAuth for integrations, you can:

1. **Remove or comment out** the Google OAuth code
2. **Or set a placeholder** in `.env`:
   ```env
   VITE_GOOGLE_CLIENT_ID=placeholder
   ```

### Option 4: Fix Redirect URI Mismatch

The redirect URI in your code must **exactly match** what's in Google Cloud Console:

**Current redirect URI in code:**
```typescript
const redirectUri = `${window.location.origin}/settings/integrations/callback`;
```

**Make sure this exact URL is added to Google Cloud Console:**
- For localhost: `http://localhost:3003/settings/integrations/callback`
- For production: `https://yourdomain.com/settings/integrations/callback`

## 🚨 Common Issues

1. **Missing Client ID**: `VITE_GOOGLE_CLIENT_ID` is not set
2. **Wrong Redirect URI**: Doesn't match Google Cloud Console
3. **OAuth Not Enabled**: Google+ API not enabled in Google Cloud
4. **Wrong Project**: Using client ID from different Google Cloud project

## ✅ Verification Steps

1. Check `.env` file has `VITE_GOOGLE_CLIENT_ID`
2. Verify the redirect URI matches Google Cloud Console
3. Ensure Google+ API is enabled
4. Check browser console for the exact error details

## 🔄 After Fixing

1. **Restart your dev server** (environment variables are loaded at startup)
2. **Clear browser cache** (OAuth errors can be cached)
3. **Try the integration again**

