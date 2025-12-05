# YouTube OAuth Setup Guide

## Quick Fix for "Unknown error"

If you're seeing "Unknown error" when clicking "Authenticate with Google", follow these steps:

### 1. Restart Backend Server

The backend server needs to be restarted to register the new YouTube OAuth routes:

```bash
cd project/backend
# Stop the current server (Ctrl+C)
# Then restart it:
npm start
```

### 2. Configure YouTube OAuth Credentials

Add these environment variables to your `project/backend/.env` file:

```env
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_REDIRECT_URI=http://localhost:3002/settings/integrations/callback
```

### 3. Get OAuth Credentials from Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Enable **YouTube Data API v3** and **YouTube Analytics API**
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth 2.0 Client ID**
6. Application type: **Web application**
7. Authorized redirect URIs: `http://localhost:3002/settings/integrations/callback`
8. Copy the **Client ID** and **Client Secret**

### 4. Verify Backend is Running

Test the endpoint:
```bash
curl http://localhost:8080/api/youtube/auth-url
```

You should get a JSON response with `authUrl`. If you get "Cannot GET", the server needs to be restarted.

### 5. Test Authentication

1. Open the app in browser
2. Navigate to Content tab → Analyze section
3. Paste a YouTube URL
4. Click "Authenticate with Google"
5. You should be redirected to Google's OAuth page
6. After authorizing, you'll be redirected back to the app

## Troubleshooting

### Error: "Cannot connect to backend server"
- **Solution**: Make sure backend is running on port 8080
- Check: `lsof -ti:8080` should return a process ID

### Error: "YouTube OAuth credentials not configured"
- **Solution**: Add `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET` to `project/backend/.env`
- **Important**: Restart the backend server after adding credentials

### Error: "Redirect URI mismatch"
- **Solution**: Ensure the redirect URI in Google Cloud Console exactly matches:
  - `http://localhost:3002/settings/integrations/callback` (for development)
  - Or your production URL + `/settings/integrations/callback`

### Error: "Cannot GET /api/youtube/auth-url"
- **Solution**: The backend server needs to be restarted to register new routes
- Stop the server (Ctrl+C) and restart with `npm start`

## Environment Variables

### Backend (.env in `project/backend/`)
```env
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3002/settings/integrations/callback
PORT=8080
```

### Frontend (.env in `project/`)
```env
VITE_YOUTUBE_CLIENT_ID=your_client_id (optional, for frontend fallback)
VITE_YOUTUBE_REDIRECT_URI=http://localhost:3002/settings/integrations/callback
VITE_CHAT_API_BASE=http://localhost:8080
```

## Testing

After setup, test the authentication flow:

1. **Test backend endpoint**:
   ```bash
   curl http://localhost:8080/api/youtube/auth-url
   ```
   Should return: `{"success":true,"authUrl":"https://accounts.google.com/..."}`

2. **Test in browser**:
   - Open app → Content tab → Analyze
   - Paste YouTube URL
   - Click "Authenticate with Google"
   - Should redirect to Google OAuth page

3. **After authentication**:
   - You'll be redirected back to the app
   - Token will be stored in localStorage
   - You can now analyze YouTube videos with full demographics

