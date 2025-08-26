# Platform API Integration Guide

## Overview

The GYB Studio now includes comprehensive platform API integrations for real-time content performance tracking. This system allows you to track views, likes, shares, and comments across multiple social media platforms and content platforms.

## Supported Platforms

### ✅ Fully Supported (with API access)
- **YouTube** - View counts, likes, comments
- **Instagram** - Likes, comments (no direct view counts)
- **TikTok** - Play counts, likes, shares, comments
- **Facebook** - Post impressions, reach, engagement
- **Pinterest** - Save counts, engagement metrics
- **Spotify** - Popularity scores (no direct play counts)

### ⚠️ Limited Support
- **Twitter/X** - API available but requires elevated access
- **LinkedIn** - No public API for post metrics
- **Blog/Website** - Requires Google Analytics integration

### ❌ No Public API
- **Apple Podcasts** - No public API available

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in your project root with the following API keys:

```env
# YouTube Data API v3
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here

# Instagram Basic Display API
VITE_INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
VITE_INSTAGRAM_CLIENT_ID=your_instagram_client_id_here
VITE_INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret_here

# TikTok for Developers
VITE_TIKTOK_ACCESS_TOKEN=your_tiktok_access_token_here
VITE_TIKTOK_CLIENT_ID=your_tiktok_client_id_here

# Facebook Graph API
VITE_FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here
VITE_FACEBOOK_CLIENT_ID=your_facebook_client_id_here

# Pinterest API v5
VITE_PINTEREST_ACCESS_TOKEN=your_pinterest_access_token_here

# Spotify Web API
VITE_SPOTIFY_ACCESS_TOKEN=your_spotify_access_token_here
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

### 2. API Key Setup Instructions

#### YouTube Data API v3
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add the API key to your `.env` file

#### Instagram Basic Display API
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Instagram Basic Display product
4. Configure OAuth redirect URIs
5. Generate access token
6. Add tokens to your `.env` file

#### TikTok for Developers
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a new app
3. Configure app permissions
4. Generate access token
5. Add tokens to your `.env` file

#### Facebook Graph API
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure app permissions
5. Generate access token
6. Add tokens to your `.env` file

#### Pinterest API v5
1. Go to [Pinterest Developers](https://developers.pinterest.com/)
2. Create a new app
3. Configure app permissions
4. Generate access token
5. Add token to your `.env` file

#### Spotify Web API
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Create a new app
3. Configure app settings
4. Generate access token
5. Add tokens to your `.env` file

## Usage

### 1. Content Performance Tracking

The system automatically detects platforms from content URLs and tracks performance:

```typescript
import { useContentPerformance } from '../hooks/useContentPerformance';

function MyComponent() {
  const {
    performanceData,
    isLoading,
    error,
    isTracking,
    startTracking,
    stopTracking,
    updateAllContentPerformance
  } = useContentPerformance();

  // Start automatic tracking (updates every 60 minutes)
  const handleStartTracking = () => {
    startTracking(60);
  };

  // Stop tracking
  const handleStopTracking = () => {
    stopTracking();
  };

  // Manual update
  const handleUpdateNow = async () => {
    const results = await updateAllContentPerformance();
    console.log('Updated platforms:', results);
  };

  return (
    <div>
      {isTracking ? (
        <button onClick={handleStopTracking}>Stop Tracking</button>
      ) : (
        <button onClick={handleStartTracking}>Start Tracking</button>
      )}
      
      <button onClick={handleUpdateNow} disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Update Now'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      {performanceData.map(item => (
        <div key={item.contentId}>
          <h3>Content: {item.contentId}</h3>
          <p>Total Views: {item.totalViews}</p>
          <p>Total Likes: {item.totalLikes}</p>
          <p>Total Shares: {item.totalShares}</p>
          <p>Total Comments: {item.totalComments}</p>
        </div>
      ))}
    </div>
  );
}
```

### 2. Platform Detection

The system automatically detects platforms from URLs:

```typescript
import { detectPlatform, validateContentUrl } from '../utils/platformUtils';

// Detect platform from URL
const platform = detectPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
// Returns: 'youtube'

// Validate URL for specific platform
const validation = validateContentUrl('https://www.instagram.com/p/ABC123/');
// Returns: { isValid: true, detectedPlatform: 'instagram' }
```

### 3. Individual Content Performance

Track performance for a specific content item:

```typescript
import { useContentItemPerformance } from '../hooks/useContentPerformance';

function ContentPerformance({ contentId }: { contentId: string }) {
  const { performance, isLoading, error, updatePerformance } = useContentItemPerformance(contentId);

  if (isLoading) return <div>Loading performance data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!performance) return <div>No performance data available</div>;

  return (
    <div>
      <h3>Performance Summary</h3>
      <p>Total Views: {performance.totalViews}</p>
      <p>Total Likes: {performance.totalLikes}</p>
      <p>Total Shares: {performance.totalShares}</p>
      <p>Total Comments: {performance.totalComments}</p>
      
      <h4>Platform Breakdown</h4>
      {performance.platformBreakdown.map(platform => (
        <div key={platform.platform}>
          <strong>{platform.platform}</strong>: {platform.views} views
        </div>
      ))}
    </div>
  );
}
```

## API Response Examples

### YouTube API Response
```json
{
  "success": true,
  "data": {
    "platform": "youtube",
    "views": 15420,
    "likes": 1250,
    "comments": 89,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  },
  "rateLimitRemaining": 9990
}
```

### Instagram API Response
```json
{
  "success": true,
  "data": {
    "platform": "instagram",
    "views": 0,
    "likes": 456,
    "comments": 23,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

### TikTok API Response
```json
{
  "success": true,
  "data": {
    "platform": "tiktok",
    "views": 8920,
    "likes": 1234,
    "shares": 567,
    "comments": 89,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

## Error Handling

The system includes comprehensive error handling:

```typescript
// API errors are captured and displayed
if (error) {
  console.error('Performance tracking error:', error);
  // Display user-friendly error message
}

// Platform-specific errors
const results = await updateAllContentPerformance();
results.forEach(result => {
  if (!result.success) {
    console.error(`Failed to update ${result.contentId}:`, result.errors);
  }
});
```

## Rate Limits

Each platform has different rate limits:

- **YouTube**: 10,000 units/day
- **Instagram**: 200 calls/hour
- **TikTok**: 10,000 requests/hour
- **Facebook**: 200 calls/hour
- **Pinterest**: Varies by endpoint
- **Spotify**: 25 requests/second

The system automatically handles rate limiting and provides feedback when limits are reached.

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Environment Variables**: Use `.env` files for local development
3. **Access Tokens**: Rotate tokens regularly
4. **Permissions**: Use minimal required permissions for each platform
5. **HTTPS**: Always use HTTPS in production

## Troubleshooting

### Common Issues

1. **API Key Not Configured**
   - Check that environment variables are set correctly
   - Verify API keys are valid and active

2. **Rate Limit Exceeded**
   - Wait for rate limit to reset
   - Implement exponential backoff in production

3. **Invalid URLs**
   - Ensure content URLs are in correct format
   - Check platform detection logic

4. **Authentication Errors**
   - Verify access tokens are valid
   - Check token expiration dates

### Debug Mode

Enable debug logging:

```typescript
// In your component
console.log('Configured platforms:', getConfiguredPlatforms());
console.log('Platform status:', isPlatformConfigured('youtube'));
```

## Future Enhancements

1. **Additional Platforms**: Support for more social media platforms
2. **Advanced Analytics**: Engagement rate calculations, growth metrics
3. **Automated Reporting**: Scheduled performance reports
4. **Webhook Integration**: Real-time updates via webhooks
5. **Historical Data**: Performance trends over time

## Support

For issues with platform API integrations:

1. Check the platform's official API documentation
2. Verify API keys and permissions
3. Review rate limits and quotas
4. Check network connectivity and firewall settings
5. Contact platform support if needed

## Contributing

To add support for new platforms:

1. Add platform configuration to `platformUtils.ts`
2. Implement API service in `platform-apis.service.ts`
3. Add environment variable documentation
4. Update this README with setup instructions
5. Add tests for the new platform 