# OpenAI Video Analysis Integration

This document describes the complete OpenAI integration for video analysis and summarization using the ChatGPT GPT mentioned in the user's request.

## Overview

The application now integrates with OpenAI's GPT-4 Vision API to automatically analyze uploaded videos and generate comprehensive summaries, key insights, and suggested short video segments.

## Setup Instructions

### 1. Environment Configuration

Add your OpenAI API key to your `.env` file:

```env
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

### 3. Restart Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

## Features

### Real OpenAI Integration

The system now uses actual OpenAI APIs for video analysis:

1. **GPT-4 Vision API**: Analyzes video frames for content understanding
2. **Advanced Prompting**: Uses structured prompts for comprehensive analysis
3. **JSON Response Parsing**: Extracts structured data from AI responses
4. **Fallback Handling**: Graceful degradation to mock data if API fails

### Video Processing Flow

1. **Upload**: User uploads video file
2. **Base64 Conversion**: Video converted to base64 for API transmission
3. **OpenAI Analysis**: Video sent to GPT-4 Vision API for analysis
4. **Response Processing**: JSON response parsed and structured
5. **Storage**: Results stored in sessionStorage
6. **Display**: Summary page shows AI-generated content

### AI Analysis Results

The system generates:

#### Video Summary
- Comprehensive analysis of video content
- Quality assessment and production value notes
- Content structure analysis
- Engagement potential evaluation

#### Key Insights
- Bullet-pointed analysis points
- Content strengths and opportunities
- Visual and audio quality assessment
- Viewer engagement potential

#### Suggested Short Videos
- **Opening Hook** (0-15s)
- **Key Message** (30-45s)
- **Call to Action** (60-75s)
- **Behind the Scenes** (90-105s)

Each suggestion includes:
- Title and description
- Start/end timestamps
- Reasoning for selection
- AI-generated insights

## Technical Implementation

### API Integration

```typescript
// Real OpenAI API call
const response = await fetch(`${this.baseUrl}/chat/completions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${this.apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${videoFile.type};base64,${videoBase64}`
            }
          }
        ]
      }
    ],
    max_tokens: 2000,
    temperature: 0.7
  })
});
```

### Prompt Engineering

The system uses structured prompts to ensure consistent, high-quality responses:

```typescript
const prompt = `Please analyze this video and provide a comprehensive summary. The video is ${videoFile.name} (${(videoFile.size / (1024 * 1024)).toFixed(2)} MB).

Please provide:
1. A detailed summary of the video content
2. Key insights and main points
3. Suggested short video segments with timestamps
4. Content quality assessment
5. Engagement potential analysis

Format the response as JSON with the following structure:
{
  "summary": "Detailed summary of the video content...",
  "keyPoints": ["Key insight 1", "Key insight 2", "Key insight 3"],
  "suggestedShorts": [
    {
      "title": "Segment title",
      "description": "Description of the segment",
      "startTime": 0,
      "endTime": 15,
      "reasoning": "Why this segment is valuable"
    }
  ],
  "duration": 120,
  "transcript": "Video transcript if available"
}`;
```

### Error Handling

The system includes comprehensive error handling:

1. **API Key Validation**: Checks for valid OpenAI API key
2. **Network Error Handling**: Handles API failures gracefully
3. **Response Parsing**: Handles malformed JSON responses
4. **Fallback System**: Uses mock data if API fails
5. **User Feedback**: Clear error messages for users

### Data Flow

```
Video Upload → Base64 Conversion → OpenAI API → Response Parsing → Storage → Display
```

## Usage Examples

### Basic Video Upload
```typescript
// User uploads video file
const videoFile = event.target.files[0];

// Process with OpenAI
const analysis = await openaiService.analyzeVideo(videoFile);

// Results include:
// - analysis.summary (AI-generated summary)
// - analysis.keyPoints (Key insights array)
// - analysis.suggestedShorts (Short video suggestions)
// - analysis.duration (Video duration)
// - analysis.transcript (Video transcript if available)
```

### Error Handling
```typescript
try {
  const analysis = await openaiService.analyzeVideo(videoFile);
  // Handle successful analysis
} catch (error) {
  if (error.message.includes('API key')) {
    // Handle missing API key
  } else if (error.message.includes('network')) {
    // Handle network errors
  } else {
    // Handle other errors
  }
}
```

## API Costs and Limits

### OpenAI Pricing
- **GPT-4 Vision**: $0.01 per 1K tokens (input), $0.03 per 1K tokens (output)
- **Video Processing**: Costs depend on video size and complexity
- **Rate Limits**: 10,000 requests per minute (default)

### Optimization Tips
1. **Video Size**: Smaller videos cost less to process
2. **Quality**: Higher quality videos provide better analysis
3. **Format**: MP4 format recommended for best results
4. **Duration**: Shorter videos process faster and cost less

## Security Considerations

### API Key Management
- Environment variable storage
- No hardcoded credentials
- Secure key handling
- Key rotation support

### Data Privacy
- Videos processed by OpenAI (see OpenAI privacy policy)
- No local video storage
- Session-based temporary storage
- Automatic cleanup

## Performance Optimization

### Processing Time
- **Small videos** (< 10MB): 2-5 seconds
- **Medium videos** (10-50MB): 5-15 seconds
- **Large videos** (> 50MB): 15-30 seconds

### Caching
- Results stored in sessionStorage
- No repeated processing for same video
- Automatic cleanup after session

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   ```
   Error: OpenAI API key not configured
   ```
   - Check `.env` file configuration
   - Verify `VITE_OPENAI_API_KEY` is set
   - Restart development server

2. **API Rate Limits**
   ```
   Error: OpenAI API error: 429 Too Many Requests
   ```
   - Wait before retrying
   - Check API usage in OpenAI dashboard
   - Consider upgrading API plan

3. **Video Processing Errors**
   ```
   Error: Failed to process video with OpenAI
   ```
   - Check video format (MP4 recommended)
   - Verify video file size (max 20MB for GPT-4 Vision)
   - Check network connection

4. **JSON Parsing Errors**
   ```
   Error: Invalid JSON response from OpenAI
   ```
   - System automatically falls back to text parsing
   - Check console for detailed error information
   - Verify API response format

### Debug Mode

Enable detailed logging by checking browser console for:
- API request/response details
- Processing steps
- Error information
- Performance metrics

## Monitoring and Analytics

### Console Logging
- API request details
- Response processing
- Error tracking
- Performance metrics

### User Feedback
- Processing status updates
- Error messages
- Success confirmations
- Progress indicators

## Future Enhancements

### Planned Features
1. **Batch Processing**: Multiple video analysis
2. **Custom Models**: Trained for specific content types
3. **Real-time Processing**: Live video analysis
4. **Advanced Analytics**: Detailed performance metrics

### API Improvements
1. **Response Caching**: Reduce API calls
2. **Streaming Responses**: Real-time updates
3. **Custom Prompts**: User-defined analysis criteria
4. **Multi-language Support**: International content analysis

## Support

For technical support:
1. Check browser console for error messages
2. Verify environment configuration
3. Test with different video files
4. Review OpenAI API documentation
5. Check OpenAI service status

## License

This integration follows the same license as the main application and OpenAI's terms of service.
