# OpenAI Whisper + GPT Video Analysis Pipeline

## Overview

This document describes the OpenAI-based video analysis pipeline that replaces the Descript API. The system uses **OpenAI Whisper** for transcription and **GPT-4/4o** for content segmentation and metadata generation.

## Architecture

### Pipeline Flow

1. **Input**: Upload a long-form video (MP4, MOV, etc.)
2. **Step 1 - Transcription**: Use OpenAI Whisper API to transcribe audio with timestamps
3. **Step 2 - Content Segmentation**: Use GPT-4/4o to automatically detect highlight moments
4. **Step 3 - Short-Form Clip Generation**: Extract timestamps for each segment
5. **Step 4 - Auto-Generate Metadata**: GPT generates titles, captions, descriptions, and hashtags
6. **Output**: Return structured JSON with segments + timestamps + metadata

## Backend Implementation

### Service File: `backend/openaiVideoService.js`

The service provides the following functions:

1. **`transcribeWithWhisper(fileBuffer, filename, mimeType)`**
   - Transcribes audio/video using OpenAI Whisper API
   - Returns `{ text, segments, duration }` with timestamps
   - Uses `verbose_json` format to get segment-level timestamps

2. **`analyzeWithGPT(transcript, segments, duration)`**
   - Analyzes transcript using GPT-4/4o
   - Identifies 3-5 highlight moments optimized for short-form content
   - Generates metadata for each segment:
     - Titles (5-10 words)
     - Captions (1-2 sentences)
     - Descriptions (2-3 sentences)
     - Hashtags (5-8 relevant tags)
     - Hooks (actual opening text from segment)
   - Returns `{ summary, highlights, segments }`

3. **`transcribeAndAnalyze(fileBuffer, filename, mimeType)`**
   - Complete workflow: transcribe → analyze → return results
   - Returns `{ summary, highlights, transcript, segments, duration }`

### API Endpoint: `POST /api/descript/upload`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `{ media: File }`

**Response (Success):**
```json
{
  "success": true,
  "requestId": "uuid",
  "data": {
    "summary": "Video summary text",
    "highlights": ["Highlight 1", "Highlight 2"],
    "transcript": "Full transcript text",
    "segments": [
      {
        "startTime": 12.5,
        "endTime": 28.3,
        "title": "Compelling Title Here",
        "caption": "Engaging caption text",
        "description": "Detailed description of why this moment is viral-worthy",
        "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
        "hook": "The actual opening text from this segment"
      }
    ],
    "duration": 180.5
  },
  "metadata": {
    "filename": "video.mp4",
    "size": 1234567,
    "mimeType": "video/mp4",
    "processingTimeMs": 5000
  }
}
```

**Supported File Types:**
- Video: `video/mp4`, `video/mpeg`, `video/quicktime`, `video/x-msvideo`, `video/webm`
- Audio: `audio/mpeg`, `audio/mp4`, `audio/wav`, `audio/x-wav`, `audio/webm`

**File Size Limit:** 25MB (Whisper API limit)

**Error Handling:**
- 400: Invalid file or missing file
- 413: File too large (>25MB)
- 429: OpenAI API quota exceeded
- 503: OpenAI API not configured
- 504: Processing timeout
- 500: Other errors

## Frontend Implementation

### React Hook: `useDescriptAnalysis()`

**Location:** `src/hooks/useDescriptAnalysis.ts`

**Updated Types:**
```typescript
export interface VideoSegment {
  startTime: number; // Start timestamp in seconds
  endTime: number; // End timestamp in seconds
  title: string; // Compelling title (5-10 words)
  caption: string; // Engaging caption for social media
  description: string; // Detailed description explaining viral potential
  hashtags: string[]; // Array of relevant hashtags (without #)
  hook: string; // The actual opening line/text from this segment
}

export interface DescriptAnalysisResult {
  summary: string;
  highlights: string[];
  transcript: string;
  segments?: VideoSegment[]; // New: segments with timestamps and metadata
  duration?: number; // Video duration in seconds
}
```

**Usage:**
```tsx
import { useDescriptAnalysis } from '../hooks/useDescriptAnalysis';

function MyComponent() {
  const { analyzeMedia, result, error, isLoading, reset } = useDescriptAnalysis();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await analyzeMedia(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="video/*,audio/*" />
      
      {isLoading && <p>Analyzing media...</p>}
      
      {error && (
        <div className="error">
          <p>{error.message}</p>
          {error.suggestion && <p>{error.suggestion}</p>}
        </div>
      )}
      
      {result && (
        <div>
          <h3>Summary</h3>
          <p>{result.summary}</p>
          
          <h3>Highlights</h3>
          <ul>
            {result.highlights.map((highlight, i) => (
              <li key={i}>{highlight}</li>
            ))}
          </ul>
          
          <h3>Segments</h3>
          {result.segments?.map((segment, i) => (
            <div key={i}>
              <h4>{segment.title}</h4>
              <p>Time: {segment.startTime}s - {segment.endTime}s</p>
              <p>{segment.caption}</p>
              <p>{segment.description}</p>
              <p>Hashtags: {segment.hashtags.join(', ')}</p>
              <p>Hook: {segment.hook}</p>
            </div>
          ))}
          
          <h3>Transcript</h3>
          <p>{result.transcript}</p>
        </div>
      )}
    </div>
  );
}
```

## Environment Variables

Add these to your `.env` file:

```bash
# OpenAI API Configuration (required)
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Use a different model for video analysis (default: gpt-4o)
OPENAI_VIDEO_MODEL=gpt-4o
```

**Note:** The same `OPENAI_API_KEY` used for chat is used for video analysis. No separate key needed.

## Setup Instructions

1. **Get OpenAI API Key:**
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Sign up or log in
   - Go to API Keys section: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

2. **Configure Environment Variables:**
   - Add `OPENAI_API_KEY` to your `.env` file
   - Optionally set `OPENAI_VIDEO_MODEL` (defaults to `gpt-4o`)
   - Restart the backend server

3. **Test the Integration:**
   ```bash
   # Test upload endpoint
   curl -X POST http://localhost:8080/api/descript/upload \
     -F "media=@/path/to/video.mp4" \
     -H "x-request-id: test-123"
   ```

## Key Features

### 1. Accurate Transcription
- Uses OpenAI Whisper API with `verbose_json` format
- Returns segment-level timestamps for precise clip extraction
- Supports both audio and video files

### 2. Intelligent Segmentation
- GPT-4/4o analyzes transcript to identify viral moments
- Focuses on:
  - Emotional hooks
  - High-value insights
  - Natural conversation peaks
  - Viral potential for short-form platforms

### 3. Rich Metadata Generation
- **Titles**: Compelling, click-worthy (5-10 words)
- **Captions**: Engaging social media captions (1-2 sentences)
- **Descriptions**: Detailed explanations of viral potential (2-3 sentences)
- **Hashtags**: Relevant, trending tags (5-8 tags)
- **Hooks**: Actual opening text from segments

### 4. Short-Form Optimization
- Segments optimized for 15-60 second clips
- Perfect for TikTok, Instagram Reels, YouTube Shorts
- Timestamps ready for video trimming

## Performance

- **Average Processing Time**: 5-15 seconds per request
- **Models Used**:
  - Whisper-1 for transcription
  - GPT-4o for analysis (configurable)
- **Token Usage**: ~2000-4000 tokens per request
- **Response Format**: Structured JSON with segments

## Error Handling

The implementation includes comprehensive error handling:

1. **File Validation**: Checks file type and size before processing
2. **API Errors**: Handles OpenAI API failures gracefully
3. **Parse Errors**: Falls back to generated segments if JSON parsing fails
4. **Timeout**: Handles long-running requests
5. **Quota Errors**: Clear messages for rate limit issues

## Fallback Behavior

If GPT analysis fails or returns invalid data, the system:
1. Generates fallback segments based on transcript length
2. Distributes segments evenly across video duration
3. Provides default titles, captions, and hooks
4. Ensures at least 3 segments are always returned

## Migration from Descript

### What Changed

- ✅ **Replaced Descript API** with OpenAI Whisper + GPT pipeline
- ✅ **Enhanced output** with segment-level metadata
- ✅ **Improved accuracy** with GPT-4/4o analysis
- ✅ **Simplified setup** (only need OpenAI API key)

### Backward Compatibility

- ✅ Same endpoint: `/api/descript/upload`
- ✅ Same response structure (with additions)
- ✅ Frontend hook works without changes
- ✅ Existing code continues to work

### Breaking Changes

- ⚠️ File size limit reduced from 50MB to 25MB (Whisper API limit)
- ⚠️ Requires `OPENAI_API_KEY` instead of `DESCRIPT_API_KEY`

## Troubleshooting

### "OpenAI API not configured" Error
- Ensure `OPENAI_API_KEY` is set in `.env` file
- Restart the backend server after adding the key
- Verify the key starts with `sk-`

### "File too large" Error
- Whisper API has a 25MB limit
- Compress or trim your video
- Consider splitting long videos into smaller chunks

### "Quota exceeded" Error
- Check your OpenAI API usage limits
- Verify billing is set up correctly
- Wait a few minutes before retrying

### "Processing timeout" Error
- Video may be too long or complex
- Try with a shorter file
- Check OpenAI API status

## Future Enhancements

Potential improvements:
1. **Video Trimming**: Automatically extract shorts using timestamps
2. **Thumbnail Generation**: Generate thumbnails for each segment
3. **Platform-Specific Optimization**: Different segments for TikTok vs Instagram
4. **A/B Testing**: Generate multiple variations of hooks
5. **Analytics**: Track which segments perform best
6. **Batch Processing**: Process multiple videos at once

## Notes

- The endpoint `/api/descript/upload` is kept for backward compatibility
- The system uses the same OpenAI API key as chat features
- Whisper API automatically extracts audio from video files
- GPT-4o is used by default for better analysis quality
- All timestamps are in seconds for easy video processing

