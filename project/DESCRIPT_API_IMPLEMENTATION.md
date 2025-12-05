# Descript API Implementation

## Overview
This document describes the Descript API integration for media upload, transcription, and analysis.

## Backend Implementation

### Service File: `backend/descriptService.js`

The service provides the following functions:

1. **`uploadMedia(fileBuffer, filename, mimeType)`**
   - Uploads media file to Descript
   - Returns `{ uploadId, projectId }`

2. **`createTranscriptionJob(uploadId)`**
   - Creates a transcription job for the uploaded media
   - Returns `{ jobId, projectId }`

3. **`pollTranscriptionJob(jobId, maxWaitTime, pollInterval)`**
   - Polls transcription job until complete
   - Default timeout: 5 minutes
   - Default poll interval: 3 seconds
   - Returns `{ status, transcript }`

4. **`getTranscript(projectId)`**
   - Retrieves transcript, summary, and highlights from Descript project
   - Returns `{ transcript, summary, highlights }`

5. **`uploadAndTranscribe(fileBuffer, filename, mimeType)`**
   - Complete workflow: upload → transcribe → retrieve results
   - Returns `{ summary, highlights, transcript }`

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
    "transcript": "Full transcript text"
  },
  "metadata": {
    "filename": "video.mp4",
    "size": 1234567,
    "mimeType": "video/mp4",
    "processingTimeMs": 5000
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message",
  "requestId": "uuid",
  "suggestion": "Optional suggestion"
}
```

**Supported File Types:**
- Video: `video/mp4`, `video/mpeg`, `video/quicktime`, `video/x-msvideo`, `video/webm`
- Audio: `audio/mpeg`, `audio/mp4`, `audio/wav`, `audio/x-wav`, `audio/webm`

**File Size Limit:** 50MB

**Error Handling:**
- 400: Invalid file or missing file
- 502: Upload to Descript failed
- 503: Descript API not configured
- 504: Transcription job timeout
- 500: Other errors

## Frontend Implementation

### React Hook: `useDescriptAnalysis()`

**Location:** `src/hooks/useDescriptAnalysis.ts`

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
          
          <h3>Transcript</h3>
          <p>{result.transcript}</p>
        </div>
      )}
    </div>
  );
}
```

**Hook API:**
- `analyzeMedia(file: File)`: Upload and analyze media file
- `result: DescriptAnalysisResult | null`: Analysis results
- `error: DescriptAnalysisError | null`: Error information
- `isLoading: boolean`: Loading state
- `reset()`: Clear results and errors

## Environment Variables

Add these to your `.env` file:

```bash
# Descript API Configuration
DESCRIPT_API_KEY=your_descript_api_key_here
DESCRIPT_PROJECT_ID=your_descript_project_id_here

# Frontend (optional, if needed)
VITE_DESCRIPT_API_KEY=your_descript_api_key_here
VITE_DESCRIPT_PROJECT_ID=your_descript_project_id_here
```

## Setup Instructions

1. **Get Descript API Credentials:**
   - Sign up for a Descript account
   - Create a project in Descript
   - Generate an API key from Descript dashboard
   - Note your project ID

2. **Configure Environment Variables:**
   - Add `DESCRIPT_API_KEY` and `DESCRIPT_PROJECT_ID` to your `.env` file
   - Restart the backend server

3. **Test the Integration:**
   ```bash
   # Test upload endpoint
   curl -X POST http://localhost:8080/api/descript/upload \
     -F "media=@/path/to/video.mp4" \
     -H "x-request-id: test-123"
   ```

## Notes

- The implementation assumes Descript API v1 structure
- Transcription polling has a 5-minute timeout by default
- File size limit is 50MB (can be adjusted in `server.js`)
- The service handles errors gracefully and provides user-friendly messages
- All API calls are authenticated using Bearer token

## Troubleshooting

### "Descript API not configured" Error
- Ensure `DESCRIPT_API_KEY` and `DESCRIPT_PROJECT_ID` are set in `.env`
- Restart the backend server after adding environment variables

### "Transcription job timed out" Error
- The media file might be too long or complex
- Try with a shorter file
- Check Descript API status

### "Failed to upload file" Error
- Check file format is supported
- Ensure file size is under 50MB
- Verify Descript API key is valid

### "Invalid response from Descript" Error
- Descript API structure may have changed
- Check Descript API documentation for latest structure
- Update `descriptService.js` if needed


