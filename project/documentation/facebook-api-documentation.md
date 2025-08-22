# Facebook API Documentation

## Overview
This document provides the Facebook Graph API endpoints and JSON structures used in the GYB application for fetching page insights and post metrics.

## API Configuration

### Base URL
```
https://graph.facebook.com/v18.0
```

### Required Environment Variables
```env
VITE_FACEBOOK_PAGE_ID=your_page_id
VITE_FACEBOOK_ACCESS_TOKEN=your_access_token
```

## API Endpoints

### 1. Page Insights
**Endpoint:** `GET /{page-id}/insights`

**Parameters:**
- `access_token`: Your page access token
- `metric`: Comma-separated list of metrics
- `period`: Time period (day, week, month)
- `since`: Start date (ISO 8601)
- `until`: End date (ISO 8601)

**Example Request:**
```bash
curl -X GET \
  "https://graph.facebook.com/v18.0/123456789/insights?metric=page_impressions,page_engaged_users,page_post_engagements&period=day&access_token=YOUR_ACCESS_TOKEN"
```

**Response Structure:**
```json
{
  "data": [
    {
      "name": "page_impressions",
      "period": "day",
      "values": [
        {
          "value": 25000,
          "end_time": "2024-01-15T07:00:00+0000"
        }
      ],
      "title": "Page Impressions",
      "description": "The number of times your Page was viewed",
      "id": "123456789/insights/page_impressions/day"
    }
  ]
}
```

### 2. Page Posts with Metrics
**Endpoint:** `GET /{page-id}/posts`

**Parameters:**
- `access_token`: Your page access token
- `fields`: Comma-separated list of fields
- `limit`: Number of posts to retrieve

**Example Request:**
```bash
curl -X GET \
  "https://graph.facebook.com/v18.0/123456789/posts?fields=id,message,created_time,insights.metric(post_impressions,post_reactions_by_type_total,post_clicks,post_shares,post_comments)&limit=25&access_token=YOUR_ACCESS_TOKEN"
```

**Response Structure:**
```json
{
  "data": [
    {
      "id": "123456789_987654321",
      "message": "Check out our latest content!",
      "created_time": "2024-01-15T10:30:00+0000",
      "insights": {
        "data": [
          {
            "name": "post_impressions",
            "values": [
              {
                "value": 5000,
                "end_time": "2024-01-15T07:00:00+0000"
              }
            ]
          },
          {
            "name": "post_reactions_by_type_total",
            "values": [
              {
                "value": 450,
                "end_time": "2024-01-15T07:00:00+0000"
              }
            ]
          }
        ]
      }
    }
  ]
}
```

### 3. Page Information
**Endpoint:** `GET /{page-id}`

**Example Request:**
```bash
curl -X GET \
  "https://graph.facebook.com/v18.0/123456789?fields=id,name,category,fan_count,verification_status&access_token=YOUR_ACCESS_TOKEN"
```

**Response Structure:**
```json
{
  "id": "123456789",
  "name": "Your Facebook Page Name",
  "category": "Technology",
  "fan_count": 15000,
  "verification_status": "verified",
  "followers_count": 14500
}
```

## Available Metrics

### Page-Level Metrics
- `page_impressions` - Total page views
- `page_engaged_users` - Users who engaged with the page
- `page_post_engagements` - Total post engagements
- `page_fans` - Total page fans/likes
- `page_fan_adds` - New fans added
- `page_fan_removes` - Fans removed

### Post-Level Metrics
- `post_impressions` - Number of times post was viewed
- `post_reactions_by_type_total` - Total reactions (likes, loves, etc.)
- `post_reactions_like_total` - Total likes
- `post_reactions_love_total` - Total loves
- `post_reactions_wow_total` - Total wow reactions
- `post_reactions_haha_total` - Total haha reactions
- `post_reactions_sorry_total` - Total sorry reactions
- `post_reactions_anger_total` - Total anger reactions
- `post_clicks` - Number of clicks on the post
- `post_shares` - Number of shares
- `post_comments` - Number of comments

## Error Handling

### Common Error Responses

**Invalid Access Token:**
```json
{
  "error": {
    "message": "Invalid OAuth 2.0 Access Token",
    "type": "OAuthException",
    "code": 190,
    "error_subcode": 460,
    "error_user_msg": "The access token is invalid",
    "error_user_title": "Invalid Access Token",
    "fbtrace_id": "ABC123DEF456"
  }
}
```

**Insufficient Permissions:**
```json
{
  "error": {
    "message": "(#200) Requires extended permission: pages_read_engagement",
    "type": "OAuthException",
    "code": 200,
    "fbtrace_id": "DEF456GHI789"
  }
}
```

**Page Not Found:**
```json
{
  "error": {
    "message": "Unsupported get request. Object with ID '123456789' does not exist, cannot be loaded due to missing permissions, or query includes fields that cannot be accessed.",
    "type": "GraphMethodException",
    "code": 100,
    "error_subcode": 33,
    "fbtrace_id": "GHI789JKL012"
  }
}
```

## Required Permissions

To access page insights and post metrics, your Facebook App needs these permissions:

1. **pages_read_engagement** - Read page insights and engagement data
2. **pages_manage_posts** - Post to pages and manage page content
3. **pages_read_user_content** - Read user-generated content on the page

## Rate Limits

Facebook API has rate limits:
- **Page Insights**: 200 calls per hour per page
- **Post Insights**: 200 calls per hour per post
- **General API**: 200 calls per hour per user

## Implementation Notes

### Data Processing
The application processes the raw Facebook API responses to extract:
- Total impressions across all posts
- Total reactions (sum of all reaction types)
- Individual post metrics for detailed analysis
- Reaction breakdowns (likes, loves, shares, etc.)

### Mock Data Fallback
When Facebook credentials are not configured, the application provides realistic mock data:
- Impressions: 1,000 - 50,000 range
- Reactions: 100 - 5,000 range
- Posts: 5 - 20 range

### Caching Strategy
Consider implementing caching to avoid hitting rate limits:
- Cache page insights for 1 hour
- Cache post insights for 30 minutes
- Use localStorage for client-side caching

## Testing

### Test with Graph API Explorer
1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app and page
3. Test endpoints with your access token
4. Verify response structure matches expected format

### Local Testing
1. Set environment variables in `.env` file
2. Restart development server
3. Check browser console for API responses
4. Verify metrics display correctly in the application 