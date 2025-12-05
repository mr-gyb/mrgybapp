# YouTube Analytics API Implementation Guide

## ✅ Implementation Complete

This document describes the complete YouTube Analytics API integration for the Content Analysis Dashboard.

## 🔐 OAuth 2.0 Flow

### Backend Endpoints

1. **POST `/api/youtube/oauth/token`** - Exchange authorization code for access token
   - Input: `{ code: string, redirectUri: string }`
   - Output: `{ access_token, refresh_token, expires_in, token_type, scope }`

2. **POST `/api/youtube/oauth/refresh`** - Refresh expired access token
   - Input: `{ refreshToken: string }`
   - Output: `{ access_token, expires_in, token_type }`

### OAuth Scopes

The implementation requests these scopes:
- `https://www.googleapis.com/auth/youtube.readonly`
- `https://www.googleapis.com/auth/yt-analytics.readonly`
- `https://www.googleapis.com/auth/youtube.force-ssl`

### Redirect URI

Default: `http://localhost:3002/settings/integrations/callback`

Can be configured via:
- Frontend: `VITE_YOUTUBE_REDIRECT_URI`
- Backend: `YOUTUBE_REDIRECT_URI`

## 📊 YouTube Analytics API Endpoints

### 1. GET `/api/youtube/overview`
Returns channel overview metrics:
- Views
- Likes
- Comments
- Estimated Minutes Watched
- Subscribers Gained

**Query Parameters:**
- `accessToken` (required) - YouTube OAuth access token

**Response:**
```json
{
  "success": true,
  "data": {
    "views": 1000000,
    "likes": 50000,
    "comments": 5000,
    "estimatedMinutesWatched": 500000,
    "subscribersGained": 10000
  }
}
```

### 2. GET `/api/youtube/demographics`
Returns gender demographics breakdown.

**Response:**
```json
{
  "success": true,
  "data": [
    { "gender": "Female", "percentage": 45.5 },
    { "gender": "Male", "percentage": 54.5 }
  ]
}
```

### 3. GET `/api/youtube/geography`
Returns top countries by viewer percentage.

**Response:**
```json
{
  "success": true,
  "data": [
    { "country": "United States", "percentage": 40.2 },
    { "country": "United Kingdom", "percentage": 15.8 }
  ]
}
```

### 4. GET `/api/youtube/traffic-source`
Returns traffic sources by views.

**Response:**
```json
{
  "success": true,
  "data": [
    { "source": "YOUTUBE_SEARCH", "views": 500000 },
    { "source": "EXTERNAL", "views": 200000 }
  ]
}
```

### 5. GET `/api/youtube/age-groups`
Returns age group demographics.

**Response:**
```json
{
  "success": true,
  "data": [
    { "ageGroup": "18-24", "percentage": 25.5 },
    { "ageGroup": "25-34", "percentage": 35.2 }
  ]
}
```

## 🎨 Frontend Integration

### Components

1. **`AnalysisDashboard.tsx`** - Main dashboard component
   - URL paste input with platform detection
   - YouTube authentication prompt
   - Metrics overview cards
   - Audience insights charts

2. **`YouTubeAuthButton.tsx`** - Authentication button
   - OAuth flow initiation
   - Authentication status display
   - Manual token entry removed (deprecated)

### Services

1. **`youtubeOAuth.service.ts`** - OAuth management
   - Token storage (localStorage)
   - Auto-refresh expired tokens
   - State verification for security

2. **`youtubeAnalytics.service.ts`** - Analytics data fetching
   - Calls backend endpoints
   - Handles token refresh automatically
   - Error handling with retry logic

## 🔄 User Flow

1. User pastes YouTube URL → Platform detected
2. If not authenticated → Shows authentication prompt
3. User clicks "Authenticate with Google" → Redirects to Google OAuth
4. User grants permissions → Redirects back with code
5. Backend exchanges code for tokens → Stores in localStorage
6. User clicks "Done" → Fetches analytics from all endpoints
7. Displays data in charts and metrics cards

## 🛡️ Error Handling

### Token Expiration
- Automatically refreshes using refresh token
- If refresh fails, prompts user to re-authenticate

### Quota Exceeded
- Returns 429 status with friendly message
- Suggests retrying later

### Invalid Credentials
- Returns 401 status
- Prompts user to re-authenticate

### Scope Issues
- Clear error message about missing permissions
- Instructions to re-authenticate with all scopes

## 📋 Environment Variables

### Frontend (.env)
```env
VITE_YOUTUBE_CLIENT_ID=your_client_id
VITE_YOUTUBE_CLIENT_SECRET=your_client_secret
VITE_YOUTUBE_REDIRECT_URI=http://localhost:3002/settings/integrations/callback
VITE_YOUTUBE_API_KEY=your_api_key
```

### Backend (.env)
```env
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3002/settings/integrations/callback
YOUTUBE_API_KEY=your_api_key
```

## 🚀 Setup Instructions

1. **Google Cloud Console Setup:**
   - Create OAuth 2.0 credentials
   - Add redirect URI: `http://localhost:3002/settings/integrations/callback`
   - Enable YouTube Analytics API
   - Enable YouTube Data API v3

2. **Environment Configuration:**
   - Copy `env-template.txt` to `.env`
   - Fill in YouTube OAuth credentials
   - Set redirect URI

3. **Test Authentication:**
   - Navigate to Content Tab → Analyze
   - Paste a YouTube URL
   - Click "Authenticate with Google"
   - Complete OAuth flow
   - Click "Done" to fetch analytics

## 📊 Charts Displayed

1. **Gender Distribution** - Donut chart (Pie chart)
2. **Age Groups** - Bar chart
3. **Top Countries** - Bar chart
4. **Traffic Sources** - Bar chart

All charts use Recharts library and display real data from YouTube Analytics API.

## ✨ Features

- ✅ Complete OAuth 2.0 flow
- ✅ Automatic token refresh
- ✅ Real-time analytics fetching
- ✅ Error handling with user-friendly messages
- ✅ Quota exceeded detection
- ✅ Scope validation
- ✅ Secure token storage
- ✅ State verification (CSRF protection)

## 🔧 Troubleshooting

### "Redirect URI mismatch"
- Ensure redirect URI in Google Cloud Console matches exactly
- Check `VITE_YOUTUBE_REDIRECT_URI` in `.env`

### "Invalid authorization code"
- Code expires quickly, try authenticating again
- Ensure code is used only once

### "Quota exceeded"
- Wait before retrying
- Check YouTube Analytics API quota in Google Cloud Console

### "Authentication expired"
- Token refresh should happen automatically
- If refresh fails, re-authenticate

## 📝 Notes

- Manual token entry has been removed (deprecated)
- All token operations go through secure backend
- Tokens are stored in localStorage (consider server-side storage for production)
- Refresh tokens are used automatically when access tokens expire

