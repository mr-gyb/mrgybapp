# Content Analysis System

## Overview

This system provides comprehensive content analysis for social media content, extracting themes, tones, keywords, hashtags, and platform-specific insights. It also generates inspiration queries and can fetch relevant content suggestions from web search APIs.

## Features

### 🧠 **AI-Powered Content Analysis**
- Analyzes uploaded content using OpenAI GPT-4o-mini
- Extracts themes, tones, keywords, and hashtags
- Identifies platform-specific patterns and preferences
- Provides content diversity scoring

### 🔍 **Platform Detection & Insights**
- Automatically detects platforms from URLs
- Generates platform-specific optimization tips
- Recommends time windows for content discovery
- Tracks engagement patterns per platform

### 💡 **Content Inspiration System**
- Builds intelligent search queries based on analysis
- Integrates with web search APIs (Bing, Google Custom Search)
- Scores and ranks inspiration candidates
- Provides fallback mock data for testing

### 🛡️ **Robust Error Handling**
- Circuit breaker pattern for repeated failures
- Exponential backoff retry logic
- Comprehensive error categorization
- Graceful fallbacks and user feedback

## Architecture

### Core Services

#### 1. Content Analysis Service (`src/services/contentAnalysis.service.ts`)
- Main analysis engine using OpenAI API
- Platform detection and validation
- Query building for inspiration
- Candidate scoring and ranking

#### 2. Web Search Service (`src/services/webSearch.service.ts`)
- Abstract interface for search providers
- Implementations for Bing, Google, and Mock
- Retry logic and error handling
- Platform-specific result filtering

#### 3. React Component (`src/components/content/ContentAnalysisDemo.tsx`)
- User interface for analysis
- Real-time feedback and loading states
- Error handling and user messaging
- Mode switching (basic/advanced)

## Usage

### Basic Setup

1. **Environment Variables**
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_SEARCH_PROVIDER=mock  # or 'bing' or 'google'
VITE_BING_API_KEY=your_bing_api_key  # if using Bing
VITE_GOOGLE_API_KEY=your_google_api_key  # if using Google
VITE_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id  # if using Google
```

2. **Import and Use Component**
```tsx
import ContentAnalysisDemo from './components/content/ContentAnalysisDemo';

function App() {
  const [userContent, setUserContent] = useState<ContentItem[]>([]);
  
  return (
    <ContentAnalysisDemo 
      userContent={userContent}
      onRefresh={() => console.log('Refresh requested')}
    />
  );
}
```

### API Usage

#### Content Analysis
```typescript
import { analyzeContent } from './services/contentAnalysis.service';

const analysis = await analyzeContent(contentItems);
console.log('Analysis result:', analysis);
```

#### Inspiration Generation
```typescript
import { getInspiration } from './services/contentAnalysis.service';

const inspiration = await getInspiration(analysis, contentItems, 5);
console.log('Top 5 inspiration items:', inspiration);
```

#### Web Search Integration
```typescript
import { createWebSearch } from './services/webSearch.service';

const searchProvider = createWebSearch('bing', { apiKey: 'your_key' });
const results = await searchProvider.search('query', { days: 30 });
```

## Data Structures

### ContentAnalysis Interface
```typescript
interface ContentAnalysis {
  global_summary: {
    total_items: number;
    dominant_themes: string[];
    overall_tone: string;
    primary_language: string;
    language: string;
    content_diversity_score: number;
  };
  platforms: Platform[];
  per_platform: Record<Platform, {
    present: boolean;
    themes: string[];
    tones: string[];
    keywords: string[];
    hashtags: string[];
    content_types: string[];
    recommended_time_window_days: number;
    engagement_patterns?: string[];
    audience_insights?: string[];
  }>;
}
```

### Candidate Interface
```typescript
interface Candidate {
  platform: Platform;
  title?: string;
  snippet?: string;
  url: string;
  publishedAt?: string;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
}
```

## Error Handling

### Error Categories
- **Rate Limits**: API quota exceeded
- **Authentication**: Invalid API keys
- **Network**: Timeouts and connection issues
- **Validation**: Invalid content or responses
- **Service**: External service failures

### Circuit Breaker
The system implements a circuit breaker pattern that:
- Tracks consecutive failures
- Opens circuit after 3 failures
- Resets after 60 seconds
- Provides graceful degradation

### Retry Logic
- Exponential backoff (200ms → 400ms → 800ms)
- Maximum 3 retry attempts
- Platform-specific error handling
- Fallback to mock data when needed

## Search Provider Integration

### Bing Web Search API
```typescript
const bingSearch = new BingWebSearch(apiKey);
const results = await bingSearch.search(query, { days: 30, language: 'en' });
```

**Features:**
- Date filtering support
- Language localization
- Platform detection
- Structured response parsing

### Google Custom Search API
```typescript
const googleSearch = new GoogleCustomSearch(apiKey, searchEngineId);
const results = await googleSearch.search(query, { language: 'en' });
```

**Features:**
- Custom search engine support
- Language filtering
- Rich metadata extraction
- Platform detection

### Mock Provider (Development)
```typescript
const mockSearch = new MockWebSearch();
const results = await mockSearch.search(query, { days: 30 });
```

**Features:**
- No API keys required
- Simulated network delays
- Platform-aware mock data
- Testing and development use

## Configuration Options

### Analysis Settings
```typescript
const analysisOptions = {
  model: 'gpt-4o-mini',
  maxTokens: 2000,
  temperature: 0.3,
  responseFormat: 'json_object'
};
```

### Search Settings
```typescript
const searchOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 10000,
  maxResults: 10
};
```

### Platform Filters
```typescript
const supportedPlatforms = [
  'facebook', 'instagram', 'pinterest', 'youtube',
  'tiktok', 'twitter', 'linkedin', 'spotify'
];
```

## Performance Considerations

### Caching
- Analysis results cached per content hash
- Search results cached with TTL
- Platform detection cached per URL

### Rate Limiting
- OpenAI API rate limit handling
- Search API quota management
- User session-based request queuing

### Optimization
- Lazy loading of heavy components
- Debounced search requests
- Efficient platform detection
- Minimal API payloads

## Security & Privacy

### Data Handling
- Raw content never sent to search APIs
- Only derived keywords and metadata shared
- User authentication required for analysis
- Secure API key storage

### Content Moderation
- NSFW content filtering
- Hate speech detection
- Copyright violation prevention
- Safe search enforcement

### API Security
- HTTPS-only communication
- API key rotation support
- Request signing for sensitive operations
- Rate limiting per user

## Testing

### Unit Tests
```bash
npm run test:unit contentAnalysis.service
npm run test:unit webSearch.service
```

### Integration Tests
```bash
npm run test:integration contentAnalysis
npm run test:integration webSearch
```

### Mock Data
The system includes comprehensive mock data for:
- Content analysis responses
- Web search results
- Platform detection
- Error scenarios

## Troubleshooting

### Common Issues

#### OpenAI API Errors
```bash
# Check API key configuration
echo $VITE_OPENAI_API_KEY

# Verify API quota
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/usage
```

#### Search API Issues
```bash
# Test Bing API
curl -H "Ocp-Apim-Subscription-Key: $BING_API_KEY" \
  "https://api.bing.microsoft.com/v7.0/search?q=test"

# Test Google Custom Search
curl "https://www.googleapis.com/customsearch/v1?key=$GOOGLE_API_KEY&cx=$SEARCH_ENGINE_ID&q=test"
```

#### Platform Detection
```typescript
import { detectPlatform } from './services/contentAnalysis.service';

const platform = detectPlatform('https://instagram.com/post/123');
console.log('Detected platform:', platform);
```

### Debug Mode
Enable detailed logging:
```typescript
// Set in browser console
localStorage.setItem('debug', 'content-analysis:*');

// Or in environment
VITE_DEBUG=content-analysis:*
```

## Future Enhancements

### Planned Features
- **Embeddings Integration**: Semantic similarity scoring
- **Multi-language Support**: Global content analysis
- **Advanced Analytics**: Trend prediction and forecasting
- **Content Optimization**: AI-powered improvement suggestions
- **Collaborative Filtering**: User preference learning

### API Improvements
- **Streaming Responses**: Real-time analysis updates
- **Batch Processing**: Multiple content analysis
- **Custom Models**: Fine-tuned analysis models
- **Webhook Support**: Real-time notifications

### Performance Upgrades
- **Edge Computing**: Distributed analysis
- **CDN Integration**: Global content delivery
- **Database Optimization**: Faster content retrieval
- **Caching Layers**: Multi-level performance optimization

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Comprehensive error handling
- Extensive logging

### Testing Requirements
- Unit test coverage > 80%
- Integration test coverage > 70%
- Error scenario testing
- Performance benchmarking

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the error logs
- Contact the development team
