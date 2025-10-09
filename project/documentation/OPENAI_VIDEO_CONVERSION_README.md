# OpenAI Video Conversion Service

This document describes the complete OpenAI integration for converting long videos into short-form content using advanced AI analysis and generation.

## Overview

The Video Conversion Service leverages OpenAI's GPT-4 to intelligently analyze long-form videos and automatically generate multiple short video segments optimized for social media platforms. This service provides intelligent content extraction, script generation, and engagement scoring.

## Features

### 🎬 **Intelligent Video Segmentation**
- **AI-Powered Analysis**: Uses GPT-4 to analyze video content and identify the most valuable segments
- **Smart Timing**: Automatically determines optimal start/end times for each segment
- **Engagement Scoring**: Rates each segment's viral potential (1-10 scale)
- **Content Optimization**: Tailors segments for different social media platforms

### 📝 **Advanced Script Generation**
- **Hook Creation**: Generates compelling opening hooks (0-3 seconds)
- **Value Delivery**: Structures main content for maximum impact (3-12 seconds)
- **Call-to-Action**: Creates effective CTAs (12-15 seconds)
- **Hashtag Optimization**: Includes relevant tags for discoverability

### 🎯 **Conversion Options**
- **Duration Control**: Set min/max duration for short videos
- **Target Count**: Specify how many segments to generate
- **Style Selection**: Choose from educational, entertainment, promotional, or tutorial styles
- **Tone Customization**: Professional, casual, energetic, or calm tones
- **Focus Areas**: Target specific content areas (hook, main_points, conclusion)

## Setup Instructions

### 1. Environment Configuration

Add your OpenAI API key to your `.env` file:

```env
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_VIDEO_API_KEY=your_openai_video_api_key_here
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

## Usage

### Basic Video Conversion

```typescript
import { videoConversionService } from '../services/videoConversionService';

// Convert long video to shorts
const result = await videoConversionService.convertLongVideoToShorts(
  videoFile,
  analysisResult,
  {
    maxDuration: 60,        // Maximum 60 seconds per short
    minDuration: 15,        // Minimum 15 seconds per short
    targetCount: 5,         // Generate 5 short segments
    style: 'educational',   // Educational content style
    tone: 'professional'    // Professional tone
  }
);
```

### Advanced Configuration

```typescript
const conversionOptions = {
  maxDuration: 45,                    // 45 seconds max
  minDuration: 20,                    // 20 seconds min
  targetCount: 8,                     // 8 segments
  focusAreas: ['hook', 'main_points'], // Focus on specific areas
  style: 'entertainment',             // Entertainment style
  tone: 'energetic'                   // Energetic tone
};

const result = await videoConversionService.convertLongVideoToShorts(
  videoFile,
  analysisResult,
  conversionOptions
);
```

## API Reference

### VideoConversionService

#### `convertLongVideoToShorts(videoFile, analysisResult, options)`

Converts a long video into multiple short video segments.

**Parameters:**
- `videoFile: File` - The original video file
- `analysisResult: VideoAnalysisResult` - AI analysis of the video
- `options: ConversionOptions` - Conversion configuration

**Returns:** `Promise<VideoConversionResult>`

#### `generateEnhancedScript(segment, analysisResult)`

Generates an enhanced script for a specific short segment.

**Parameters:**
- `segment: ShortVideoSegment` - The segment to enhance
- `analysisResult: VideoAnalysisResult` - Original video analysis

**Returns:** `Promise<string>` - Enhanced script

### Data Structures

#### ShortVideoSegment

```typescript
interface ShortVideoSegment {
  id: string;                    // Unique identifier
  title: string;                 // Segment title
  description: string;           // Content description
  startTime: number;             // Start time in seconds
  endTime: number;               // End time in seconds
  duration: number;              // Duration in seconds
  reasoning: string;             // Why this segment is valuable
  script: string;               // Complete script
  thumbnail?: string;            // Thumbnail URL
  tags: string[];               // Relevant tags
  engagementScore: number;      // Viral potential (1-10)
}
```

#### VideoConversionResult

```typescript
interface VideoConversionResult {
  originalVideo: {
    name: string;
    duration: number;
    size: number;
    type: string;
  };
  shortSegments: ShortVideoSegment[];
  bestSegment: ShortVideoSegment;
  conversionSummary: string;
  totalSegments: number;
  averageDuration: number;
  processingTime: number;
}
```

#### ConversionOptions

```typescript
interface ConversionOptions {
  maxDuration?: number;         // Max duration (default: 60s)
  minDuration?: number;         // Min duration (default: 15s)
  targetCount?: number;         // Number of segments (default: 5)
  focusAreas?: string[];       // Focus areas
  style?: 'educational' | 'entertainment' | 'promotional' | 'tutorial';
  tone?: 'professional' | 'casual' | 'energetic' | 'calm';
}
```

## Integration with Summary Page

The video conversion service is fully integrated with the Summary Page workflow:

1. **User uploads video** → Video analysis with OpenAI
2. **User clicks "Create Short Videos"** → Opens conversion modal
3. **AI converts video** → Generates multiple short segments
4. **User selects segment** → Chooses preferred short video
5. **User approves** → Saves to Created Shorts section
6. **User can download** → Individual or bulk download options

## AI Processing Workflow

### 1. **Content Analysis**
- Analyzes video transcript and structure
- Identifies key moments and valuable segments
- Evaluates engagement potential

### 2. **Segment Generation**
- Creates multiple short video concepts
- Generates compelling titles and descriptions
- Calculates optimal timing for each segment

### 3. **Script Creation**
- Writes complete scripts for each segment
- Optimizes for social media engagement
- Includes hooks, main content, and CTAs

### 4. **Quality Scoring**
- Rates each segment's viral potential
- Provides reasoning for recommendations
- Suggests the best performing segment

## Error Handling

The service includes comprehensive error handling:

- **API Key Validation**: Checks for valid OpenAI API key
- **Fallback Generation**: Creates segments even if API fails
- **Graceful Degradation**: Maintains functionality with limited features
- **User Feedback**: Clear error messages and recovery options

## Performance Optimization

- **Efficient Processing**: Optimized API calls and response parsing
- **Caching**: Results cached for repeated operations
- **Background Processing**: Non-blocking video conversion
- **Progress Tracking**: Real-time status updates

## Best Practices

### 1. **Content Selection**
- Choose videos with clear structure and key moments
- Ensure good audio quality for transcription
- Select content with strong hooks and conclusions

### 2. **Conversion Settings**
- Use appropriate duration limits for your platform
- Match style and tone to your audience
- Focus on high-engagement content areas

### 3. **Script Optimization**
- Review and refine AI-generated scripts
- Test different hooks and CTAs
- Monitor engagement metrics

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify API key is correct and active
   - Check API usage limits and billing
   - Ensure proper environment variable setup

2. **Poor Quality Segments**
   - Adjust conversion options (duration, style, tone)
   - Provide better source video content
   - Use focus areas to target specific content

3. **Slow Processing**
   - Check internet connection
   - Verify OpenAI API status
   - Consider reducing target segment count

### Support

For technical support or feature requests, please refer to the main project documentation or contact the development team.

## Future Enhancements

- **Video Thumbnail Generation**: AI-generated thumbnails for segments
- **A/B Testing**: Compare different script versions
- **Analytics Integration**: Track segment performance
- **Multi-language Support**: Convert videos in different languages
- **Platform Optimization**: Tailor segments for specific social platforms
