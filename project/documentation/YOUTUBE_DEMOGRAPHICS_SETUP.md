# YouTube Demographics (Age & Gender) Setup Guide

## 🎯 Overview

Yes, you **can** fetch age and gender demographics from YouTube! This feature uses the **YouTube Analytics API** (different from the YouTube Data API v3) to retrieve aggregated viewer demographics.

## 📊 Available Demographics Data

### Age Groups
- `AGE_13_17` - Ages 13-17
- `AGE_18_24` - Ages 18-24
- `AGE_25_34` - Ages 25-34
- `AGE_35_44` - Ages 35-44
- `AGE_45_54` - Ages 45-54
- `AGE_55_64` - Ages 55-64
- `AGE_65_` - Ages 65 and above

### Gender
- `FEMALE` - Female viewers
- `MALE` - Male viewers
- `GENDER_OTHER` - Other/unspecified

## 🔑 Prerequisites

1. **Google Cloud Platform Account**
2. **YouTube Analytics API Enabled**
3. **OAuth 2.0 Credentials** (not just an API key)
4. **Channel Ownership** (you can only access demographics for channels you own)

## 🚀 Step-by-Step Setup

### 1. Enable YouTube Analytics API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Library**
4. Search for "YouTube Analytics API"
5. Click **Enable**

### 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in required fields (App name, User support email, Developer contact)
   - Add scopes:
     - `https://www.googleapis.com/auth/youtube.readonly`
     - `https://www.googleapis.com/auth/yt-analytics.readonly`
   - Add test users (your email) if in testing mode
4. Create OAuth client:
   - Application type: **Web application**
   - Name: "YouTube Analytics Integration"
   - Authorized redirect URIs: `http://localhost:5173/settings/integrations/callback` (adjust for your domain)
5. Copy the **Client ID** and **Client Secret**

### 3. Configure Environment Variables

Add to your `.env` file:

```bash
# YouTube Data API (for basic stats)
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here

# YouTube Analytics API (for demographics)
VITE_YOUTUBE_CLIENT_ID=your_oauth_client_id_here
VITE_YOUTUBE_ACCESS_TOKEN=your_oauth_access_token_here
```

**⚠️ Important:** 
- The access token is obtained through OAuth flow (see step 4)
- Never commit your `.env` file to version control!

### 4. Authenticate and Get Access Token

#### Option A: Use the Integration Flow (Recommended)

1. Navigate to your app's integrations page
2. Click "Connect YouTube"
3. Authorize the app with the required scopes
4. The access token will be stored automatically

#### Option B: Manual OAuth Flow

1. Visit the OAuth URL:
   ```
   https://accounts.google.com/o/oauth2/v2/auth?
     response_type=code&
     client_id=YOUR_CLIENT_ID&
     redirect_uri=http://localhost:5173/settings/integrations/callback&
     scope=https://www.googleapis.com/auth/youtube.readonly+https://www.googleapis.com/auth/yt-analytics.readonly
   ```
2. Authorize the application
3. Exchange the authorization code for an access token
4. Store the access token in `VITE_YOUTUBE_ACCESS_TOKEN`

### 5. Restart Development Server

After adding environment variables:
```bash
npm run dev
# or
yarn dev
```

## 💻 Usage

### Using the Hook

```tsx
import { useYouTubeDemographics } from '../hooks/useYouTubeDemographics';

function DemographicsComponent() {
  const { 
    demographics, 
    isLoading, 
    error, 
    fetchDemographics,
    fetchVideoDemographics 
  } = useYouTubeDemographics();

  useEffect(() => {
    // Fetch channel demographics (last 30 days)
    fetchDemographics();
    
    // Or for a specific channel
    // fetchDemographics('UCxxxxxxxxxxxxxxxxxxxxx');
    
    // Or with custom date range
    // fetchDemographics(undefined, '2024-01-01', '2024-01-31');
  }, []);

  if (isLoading) return <div>Loading demographics...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!demographics) return null;

  return (
    <div>
      <h2>Age Groups</h2>
      {demographics.ageGroups.map(({ ageGroup, viewerPercentage }) => (
        <div key={ageGroup}>
          {ageGroup}: {viewerPercentage.toFixed(2)}%
        </div>
      ))}
      
      <h2>Gender</h2>
      {demographics.genders.map(({ gender, viewerPercentage }) => (
        <div key={gender}>
          {gender}: {viewerPercentage.toFixed(2)}%
        </div>
      ))}
    </div>
  );
}
```

### Using the Service Directly

```tsx
import { platformApiService } from '../api/services/platform-apis.service';

// Fetch channel demographics
const result = await platformApiService.fetchYouTubeDemographics();

if (result.success && result.data) {
  console.log('Age Groups:', result.data.ageGroups);
  console.log('Genders:', result.data.genders);
}

// Fetch video-specific demographics
const videoResult = await platformApiService.fetchYouTubeVideoDemographics('VIDEO_ID');
```

## 📋 API Methods

### `fetchYouTubeDemographics(channelId?, startDate?, endDate?)`

Fetches demographics for a channel.

**Parameters:**
- `channelId` (optional): YouTube channel ID. If not provided, uses authenticated user's channel.
- `startDate` (optional): Start date in `YYYY-MM-DD` format. Defaults to 30 days ago.
- `endDate` (optional): End date in `YYYY-MM-DD` format. Defaults to today.

**Returns:** `YouTubeAnalyticsResponse` with demographics data.

### `fetchYouTubeVideoDemographics(videoId, startDate?, endDate?)`

Fetches demographics for a specific video.

**Parameters:**
- `videoId` (required): YouTube video ID.
- `startDate` (optional): Start date in `YYYY-MM-DD` format. Defaults to 30 days ago.
- `endDate` (optional): End date in `YYYY-MM-DD` format. Defaults to today.

**Note:** Video must be owned by the authenticated channel.

**Returns:** `YouTubeAnalyticsResponse` with demographics data.

## 🔧 API Quotas & Limits

- **Free Tier**: 10,000 units per day
- **Rate Limit**: 1,000 requests per 100 seconds per user
- **Cost**: $5 per 1,000 additional units (if exceeded)

**Quota Usage:**
- Demographics requests: ~2 units per request (one for age, one for gender)

## 🚨 Troubleshooting

### "OAuth access token not configured"

**Solution:**
- Ensure `VITE_YOUTUBE_ACCESS_TOKEN` is set in your `.env` file
- Complete the OAuth flow to obtain an access token
- Restart your development server after adding the token

### "403 Forbidden - Insufficient Permissions"

**Solution:**
- Verify the access token has `yt-analytics.readonly` scope
- Re-authenticate with the correct scopes
- Check that YouTube Analytics API is enabled in Google Cloud Console

### "No channel found for authenticated user"

**Solution:**
- Ensure you're authenticated with a Google account that has a YouTube channel
- Verify the access token is valid and not expired
- Check that the channel exists and is accessible

### "Video not found or not accessible"

**Solution:**
- Ensure the video ID is correct
- Verify the video is owned by the authenticated channel
- Check that the video is not private or deleted

### Access Token Expired

**Solution:**
- Access tokens typically expire after 1 hour
- Implement token refresh logic (refresh tokens last longer)
- Re-authenticate if refresh token is also expired

## 📊 Data Privacy

- All demographics data is **aggregated and anonymized**
- Individual user data is **never** provided
- Data complies with privacy regulations (GDPR, etc.)
- Only channel owners can access their own channel's demographics

## 🎯 Example Response

```json
{
  "success": true,
  "data": {
    "ageGroups": [
      { "ageGroup": "AGE_18_24", "viewerPercentage": 25.5 },
      { "ageGroup": "AGE_25_34", "viewerPercentage": 35.2 },
      { "ageGroup": "AGE_35_44", "viewerPercentage": 20.1 },
      { "ageGroup": "AGE_45_54", "viewerPercentage": 12.3 },
      { "ageGroup": "AGE_55_64", "viewerPercentage": 5.2 },
      { "ageGroup": "AGE_65_", "viewerPercentage": 1.7 }
    ],
    "genders": [
      { "gender": "FEMALE", "viewerPercentage": 45.8 },
      { "gender": "MALE", "viewerPercentage": 52.1 },
      { "gender": "GENDER_OTHER", "viewerPercentage": 2.1 }
    ],
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🔗 Additional Resources

- [YouTube Analytics API Documentation](https://developers.google.com/youtube/analytics)
- [OAuth 2.0 Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [YouTube Analytics Dimensions](https://developers.google.com/youtube/analytics/dimensions)
- [YouTube Analytics Metrics](https://developers.google.com/youtube/analytics/metrics)

---

**🎉 Congratulations!** Once setup is complete, you'll have access to detailed viewer demographics to better understand your audience!

