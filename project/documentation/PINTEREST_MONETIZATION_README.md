# Pinterest Monetization Integration

## Overview

The GYB Studio now includes comprehensive Pinterest monetization tracking that fetches real-time data from Pinterest pins and calculates monetization metrics based on saves, engagement, and estimated revenue potential.

## Features

### 📊 Real-time Pinterest Analytics
- **Total Saves**: Aggregate saves across all Pinterest pins
- **Total Pins**: Count of Pinterest content items
- **Average Saves per Pin**: Performance metric for content quality
- **Engagement Rate**: Calculated based on saves and comments
- **Estimated Monthly Revenue**: Revenue projection based on save performance
- **Monetization Score**: 1-10 score indicating monetization potential

### 🔄 Automatic Data Refresh
- Auto-refreshes every 5 minutes
- Manual refresh capability
- Real-time updates when new Pinterest content is added

## Setup Instructions

### 1. Pinterest API Setup

1. **Create Pinterest App**:
   - Go to [Pinterest Developers](https://developers.pinterest.com/)
   - Create a new app
   - Note your App ID and App Secret

2. **Get Access Token**:
   - Use Pinterest OAuth 2.0 to get user access token
   - Required scopes: `pins:read`, `boards:read`

### 2. Environment Configuration

Add the following to your `.env` file:

```env
# Pinterest API Configuration
VITE_PINTEREST_ACCESS_TOKEN=your_pinterest_access_token_here
VITE_PINTEREST_APP_ID=your_pinterest_app_id_here
VITE_PINTEREST_APP_SECRET=your_pinterest_app_secret_here
```

### 3. Pinterest URL Format

The system automatically detects Pinterest URLs in the following formats:
- `https://pinterest.com/pin/1234567890/`
- `https://www.pinterest.com/pin/1234567890/`
- `https://pinterest.com/username/board-name/`

## API Integration Details

### Pinterest API v5 Endpoints Used

```typescript
// Fetch pin details with analytics
GET https://api.pinterest.com/v5/pins/{pin_id}
?fields=id,title,description,link,media_type,save_count,comment_count,created_at,updated_at
&access_token={access_token}
```

### Data Structure

```typescript
interface PinterestPinData {
  pinId: string;
  title: string;
  description: string;
  saveCount: number;
  commentCount: number;
  link: string;
  mediaType: string;
  lastUpdated: string;
}

interface PinterestAggregatedData {
  totalPins: number;
  totalSaves: number;
  totalComments: number;
  averageSavesPerPin: number;
  engagementRate: number;
  estimatedMonthlyRevenue: number;
  monetizationScore: number;
  topPerformingPins: PinterestPinData[];
  lastUpdated: string;
}
```

## Monetization Calculations

### Revenue Estimation
- **Base Rate**: $0.05 per save (conservative estimate)
- **Monthly Revenue**: `totalSaves * baseRate`
- **Growth Factor**: Based on engagement rate and performance trends

### Monetization Score (1-10)
- **1-3**: Low engagement, needs optimization
- **4-6**: Moderate performance, room for improvement
- **7-8**: Good engagement, consistent saves
- **9-10**: Excellent performance, high monetization potential

### Engagement Rate
- **Formula**: `(totalComments / totalSaves) * 100`
- **Benchmark**: 2-5% is considered good for Pinterest

## Usage in GYB Studio

### 1. Adding Pinterest Content
1. Go to GYB Studio
2. Click "Add Content"
3. Select "Pinterest" as platform
4. Paste Pinterest pin URL
5. System automatically fetches pin data

### 2. Viewing Monetization Data
1. Navigate to Monetization section
2. Select "Pinterest" from platform filter
3. View real-time metrics:
   - Total Saves
   - Total Pins
   - Average Saves per Pin
   - Engagement Rate
   - Estimated Revenue
   - Monetization Score

### 3. Top Performing Pins
- View top 5 pins by save count
- Analyze what content performs best
- Optimize future content strategy

## Error Handling

### Common Issues

1. **Invalid Access Token**:
   - Error: "Pinterest access token not configured"
   - Solution: Check `.env` file and ensure token is valid

2. **Invalid Pin URL**:
   - Error: "Could not extract Pinterest pin ID from URL"
   - Solution: Ensure URL follows Pinterest format

3. **API Rate Limits**:
   - Pinterest API has rate limits
   - System includes automatic retry logic

### Debug Information

Enable console logging to see:
- API calls being made
- Data being fetched
- Error messages
- Performance metrics

## Best Practices

### Content Optimization
1. **High-Converting Pins**: Focus on pins with high save rates
2. **Engagement**: Encourage comments to improve engagement rate
3. **Consistency**: Regular pinning improves overall performance
4. **Quality**: High-quality images perform better

### Monetization Strategy
1. **Affiliate Links**: Include affiliate links in pin descriptions
2. **Brand Partnerships**: Leverage high-performing pins for partnerships
3. **Product Promotion**: Use top pins to promote products/services
4. **Cross-Platform**: Integrate Pinterest with other social platforms

## Technical Implementation

### Hook Usage
```typescript
import { usePinterestMonetization } from '../hooks/usePinterestMonetization';

const { 
  pinterestData, 
  isLoading, 
  error, 
  lastUpdated, 
  refreshData 
} = usePinterestMonetization(userContent);
```

### Service Integration
```typescript
import { PlatformApiService } from '../api/services/platform-apis.service';

const platformApiService = new PlatformApiService();
const response = await platformApiService.fetchPinterestViews(contentItem);
```

## Troubleshooting

### Data Not Loading
1. Check API credentials in `.env`
2. Verify Pinterest URLs are valid
3. Check browser console for errors
4. Ensure network connectivity

### Inaccurate Metrics
1. Pinterest API has limitations
2. Some metrics are estimated
3. Data may have delays
4. Refresh data manually if needed

## Support

For technical support:
1. Check console logs for error messages
2. Verify API credentials
3. Test with known working Pinterest URLs
4. Contact development team for assistance

## Future Enhancements

### Planned Features
- Pinterest Analytics API integration
- Board-level analytics
- Seasonal performance tracking
- Advanced revenue modeling
- A/B testing for pin optimization

### API Improvements
- Batch pin fetching
- Historical data tracking
- Performance trend analysis
- Automated optimization suggestions
