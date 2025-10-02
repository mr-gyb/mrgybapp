# OpenAI Integration for Video Analysis

This document describes the OpenAI integration for automatic video analysis, summary generation, and short video suggestions.

## Overview

The application now integrates with OpenAI to automatically analyze uploaded videos and generate:
- **AI-powered summaries** of video content
- **Key insights** and analysis points
- **Suggested short video segments** with timestamps
- **Scripts** for short-form content

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

## Features

### Video Upload Processing

When users upload videos on `/gyb-studio/create`:

1. **File Validation**: Only video files are accepted
2. **AI Processing**: Videos are analyzed using OpenAI's capabilities
3. **Loading States**: Users see real-time processing feedback
4. **Error Handling**: Graceful error handling with user-friendly messages

### AI Analysis Results

The system generates:

#### Video Summary
- Comprehensive analysis of video content
- Quality assessment and production value notes
- Content structure analysis

#### Key Insights
- Strong opening hooks identification
- Value proposition analysis
- Visual and audio quality assessment
- Engagement potential evaluation

#### Suggested Short Videos
- **Hook & Value Proposition** (0-15s)
- **Key Insight Highlight** (30-45s)
- **Call to Action** (60-75s)
- **Behind the Scenes** (90-105s)

Each suggestion includes:
- Title and description
- Start/end timestamps
- Reasoning for selection
- Script generation capability

### Summary Page Display

The `/summary` page displays:

1. **Video Details**
   - File name, size, duration, type
   - Processing metadata

2. **AI Analysis Summary**
   - Generated content analysis
   - Quality and structure insights

3. **Key Insights**
   - Bullet-pointed analysis points
   - Content strengths and opportunities

4. **Suggested Short Videos**
   - Interactive cards for each suggestion
   - Timestamp information
   - Reasoning explanations

## Technical Implementation

### Service Architecture

```
src/services/openaiService.ts
├── OpenAIService class
├── analyzeVideo() method
├── generateScriptForShort() method
├── Mock analysis for demonstration
└── Error handling and configuration
```

### Data Flow

1. **Upload**: User uploads video file
2. **Processing**: OpenAI service analyzes content
3. **Storage**: Results stored in sessionStorage
4. **Display**: Summary page shows AI-generated content
5. **Actions**: Users can generate scripts or create shorts

### Mock Implementation

Currently uses a sophisticated mock system that:
- Simulates realistic processing time
- Generates contextual analysis based on file properties
- Provides sample data for demonstration
- Maintains API structure for easy OpenAI integration

## API Integration Points

### Current Mock Implementation
- File size-based duration estimation
- Contextual summary generation
- Realistic key points and suggestions
- Professional script templates

### Future OpenAI Integration
To enable real OpenAI processing:

1. **Vision API**: Analyze video frames for content understanding
2. **Speech-to-Text**: Generate transcripts from audio
3. **GPT-4**: Generate summaries and insights
4. **Custom Models**: Train models for video content analysis

## Usage Examples

### Basic Video Upload
```typescript
// User uploads video file
const videoFile = event.target.files[0];

// Process with OpenAI
const analysis = await openaiService.analyzeVideo(videoFile);

// Results include:
// - analysis.summary
// - analysis.keyPoints
// - analysis.suggestedShorts
// - analysis.duration
```

### Script Generation
```typescript
// Generate script for specific short
const script = await openaiService.generateScriptForShort({
  title: "Hook & Value Proposition",
  description: "Opening 15 seconds that establish the main value",
  startTime: 0,
  endTime: 15,
  originalTranscript: "..."
});
```

## Error Handling

### Configuration Errors
- Missing API key warnings
- Graceful fallback to mock data
- User-friendly error messages

### Processing Errors
- Network timeout handling
- File format validation
- Processing failure recovery

### User Experience
- Loading states during processing
- Progress indicators
- Error dismissal options

## Security Considerations

### API Key Management
- Environment variable storage
- No hardcoded credentials
- Secure key handling

### Data Privacy
- Local processing simulation
- No video data sent to external services (in mock mode)
- Session-based storage

## Performance Optimization

### Processing Time
- Simulated 2-second processing
- Realistic loading states
- Progress feedback

### Data Storage
- SessionStorage for temporary data
- Efficient data structures
- Minimal memory footprint

## Future Enhancements

### Real OpenAI Integration
1. **Video Frame Extraction**: Extract key frames for analysis
2. **Audio Processing**: Speech-to-text transcription
3. **Content Analysis**: AI-powered content understanding
4. **Custom Training**: Platform-specific optimization

### Advanced Features
1. **Real-time Processing**: Live video analysis
2. **Batch Processing**: Multiple video analysis
3. **Custom Models**: Trained for specific content types
4. **API Optimization**: Cost and performance optimization

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Check `.env` file configuration
   - Verify `VITE_OPENAI_API_KEY` is set
   - Restart development server

2. **Processing Errors**
   - Check file format compatibility
   - Verify file size limits
   - Review console for error details

3. **Display Issues**
   - Clear sessionStorage
   - Refresh page
   - Check browser console

### Debug Mode
Enable detailed logging by checking browser console for:
- Processing steps
- Data flow information
- Error details
- Performance metrics

## Support

For technical support:
1. Check console for error messages
2. Verify environment configuration
3. Test with different video files
4. Review API documentation

## License

This integration follows the same license as the main application.
