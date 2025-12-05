# Facebook/Instagram OAuth Redirect URIs

## Overview
This document lists the exact redirect URIs that must be whitelisted in your Facebook App settings for OAuth to work correctly.

## Backend Endpoints

### Get Redirect URIs
You can check the current redirect URIs by calling these endpoints:

**Facebook:**
```bash
GET /api/facebook/auth/redirect-uri
```

**Instagram:**
```bash
GET /api/instagram/auth/redirect-uri
```

## Redirect URIs to Whitelist

### Production Environment
Add these exact URLs to **Facebook App Settings > Facebook Login > Settings > Valid OAuth Redirect URIs**:

1. **Facebook OAuth:**
   ```
   https://ai.mrgyb.com/api/facebook/auth/callback
   ```

2. **Instagram OAuth:**
   ```
   https://ai.mrgyb.com/api/instagram/auth/callback
   ```

### Development Environment
For local development, also add:

1. **Facebook OAuth (Local):**
   ```
   http://localhost:8080/api/facebook/auth/callback
   ```

2. **Instagram OAuth (Local):**
   ```
   http://localhost:8080/api/instagram/auth/callback
   ```

## How to Add Redirect URIs in Facebook Developer Portal

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app
3. Navigate to **Settings > Basic**
4. Scroll down to **Facebook Login Settings**
5. Click **Settings** next to "Facebook Login"
6. In the **Valid OAuth Redirect URIs** field, add each URL above (one per line)
7. Click **Save Changes**

## OAuth Flow

1. **User clicks "Connect Facebook/Instagram"** → Frontend calls `/api/facebook/auth/url` or `/api/instagram/auth/url`
2. **Backend generates OAuth URL** with redirect URI pointing to backend callback
3. **User authorizes on Facebook** → Facebook redirects to backend callback endpoint
4. **Backend exchanges code for token** → Stores tokens in session
5. **Backend redirects to frontend** → `/settings/integrations/callback?provider=facebook&success=true`
6. **Frontend fetches tokens** → Calls `/api/facebook/auth/tokens` or `/api/instagram/auth/tokens`
7. **Frontend saves tokens** → Stores in localStorage and navigates to integrations page

## Environment Variables

The redirect URIs are determined by these environment variables:

- `BACKEND_URL` - Backend base URL (defaults to `https://ai.mrgyb.com` in production, `http://localhost:8080` in development)
- `FACEBOOK_REDIRECT_URI` - Override Facebook redirect URI (optional)
- `INSTAGRAM_REDIRECT_URI` - Override Instagram redirect URI (optional)

If `BACKEND_URL` is not set, the backend will:
- Use `https://ai.mrgyb.com` in production (`NODE_ENV=production`)
- Use `http://localhost:${PORT}` in development (default port 8080)

## Testing

To verify the redirect URIs are correct:

```bash
# Check Facebook redirect URI
curl http://localhost:8080/api/facebook/auth/redirect-uri

# Check Instagram redirect URI
curl http://localhost:8080/api/instagram/auth/redirect-uri
```

Both endpoints will return JSON with the exact redirect URI that should be whitelisted.

## Troubleshooting

### Error: "URL Blocked: This redirect failed because the redirect URI is not whitelisted"

**Solution:** Make sure you've added the exact redirect URI (including protocol, domain, and path) to Facebook App Settings.

**Common mistakes:**
- Missing `https://` or `http://` prefix
- Wrong port number (should be 8080 for backend, not 3002)
- Trailing slash (should NOT have trailing slash)
- Wrong path (should be `/api/facebook/auth/callback`, not `/settings/integrations/callback`)

### Error: "Invalid state parameter"

**Solution:** This is a CSRF protection error. Make sure:
- The backend session is working correctly
- The state parameter is being stored and verified correctly
- Cookies are being sent with requests (`credentials: 'include'`)

### Error: "No tokens found in session"

**Solution:** The backend session might have expired or cookies aren't being sent. Check:
- Session middleware is configured correctly
- Frontend is sending cookies with `credentials: 'include'`
- Backend CORS allows credentials

