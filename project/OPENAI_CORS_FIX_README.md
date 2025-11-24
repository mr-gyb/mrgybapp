# OpenAI CORS Fix - Backend Proxy Setup

## Problem
The OpenAI Whisper API doesn't allow direct browser calls due to CORS (Cross-Origin Resource Sharing) restrictions. This causes errors like:
```
Access to fetch at 'https://api.openai.com/v1/audio/transcriptions' from origin 'http://localhost:3002' has been blocked by CORS policy
```

## Solution
A backend proxy endpoint has been added to `server.js` that routes transcription requests through the server, avoiding CORS issues.

## Setup Instructions

### 1. Install Dependencies
The required packages have been installed:
- `multer` - for handling file uploads
- `form-data` - already in dependencies

### 2. Start the Backend Server
Make sure the backend server is running:

```bash
# Option 1: Run directly
npm run server

# Option 2: Run with auto-reload (development)
npm run server:dev
```

The server should start on `http://localhost:3000` (or the port specified in your `.env` file).

### 3. Verify Server is Running
You should see:
```
✅ Backend Server running on http://localhost:3000
📡 Facebook Auth Endpoint: http://localhost:3000/auth/facebook
📊 Status Check Endpoint: http://localhost:3000/api/facebook/status
🎤 OpenAI Transcription Proxy: http://localhost:3000/api/openai/transcribe
```

### 4. Environment Variables
Make sure your `.env` file has:
```env
VITE_OPENAI_VIDEO_API_KEY=your_openai_api_key_here
# OR
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

The server will use `VITE_OPENAI_VIDEO_API_KEY` first, then fall back to `VITE_OPENAI_API_KEY`.

### 5. Test the Setup
1. Start the backend server: `npm run server`
2. Start the frontend: `npm run dev`
3. Upload a video file
4. The transcription should now work without CORS errors

## How It Works

1. **Frontend** (`openaiService.ts`):
   - Sends video file to backend proxy: `http://localhost:3000/api/openai/transcribe`
   - No CORS issues since it's same-origin (or allowed origin)

2. **Backend** (`server.js`):
   - Receives file via multer middleware
   - Validates file size (25MB limit)
   - Forwards request to OpenAI API with API key
   - Returns transcript to frontend

3. **OpenAI API**:
   - Processes the transcription
   - Returns transcript text

## Troubleshooting

### Error: "Failed to connect to transcription service"
- **Solution**: Make sure the backend server is running on port 3000
- Check: `http://localhost:3000/api/openai/transcribe` should be accessible

### Error: "OpenAI API key not configured"
- **Solution**: Add `VITE_OPENAI_VIDEO_API_KEY` to your `.env` file
- Restart the backend server after adding the key

### Error: "File too large"
- **Solution**: Compress your video file to under 25MB
- Use tools like CloudConvert, HandBrake, or online video compressors

### Error: "502 Bad Gateway" or "503 Service Unavailable"
- **Solution**: OpenAI API might be temporarily down
- Wait a few minutes and try again
- Check OpenAI status page: https://status.openai.com/

## API Endpoint

**POST** `/api/openai/transcribe`

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file`: Video/audio file (max 25MB)
  - `language`: (optional) Language code (default: 'en')
  - `response_format`: (optional) Response format (default: 'text')

**Response:**
- Success (200): Plain text transcript
- Error (4xx/5xx): JSON with error message

## Notes

- The proxy endpoint handles CORS automatically
- File size validation happens on both frontend and backend
- API key is kept secure on the backend (never exposed to frontend)
- The server uses Node.js built-in `fetch` (Node 18+)

