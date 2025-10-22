# Complete Voice Chat Setup Guide

## 🎯 Overview
This guide sets up a complete voice chat feature with:
- ✅ React frontend with useVoice hook
- ✅ Spring Boot backend with OpenAI Whisper API
- ✅ Real-time error handling and user feedback
- ✅ Professional UI with loading states

## 📋 Prerequisites
- Node.js 18+ and npm
- Java 17+ and Maven/Gradle
- OpenAI API key with Whisper access

## 🚀 Step-by-Step Setup

### 1. Frontend Setup

#### Install Dependencies
```bash
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project
npm install
```

#### Environment Variables
Create `.env` file in project root:
```env
# OpenAI API Configuration (REQUIRED)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Firebase Configuration (if not already set)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 2. Backend Setup

#### Environment Variables
Create `.env` file in backend root:
```env
# OpenAI API Configuration (REQUIRED)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_URL=https://api.openai.com/v1
```

#### Start Backend Server
```bash
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project/backend/demo
./gradlew bootRun
```

### 3. Start Frontend Server
```bash
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project
npm run dev
```

## 🎤 How to Test Voice Chat

### 1. Open Application
- Frontend: http://localhost:5173
- Backend: http://localhost:8080

### 2. Test Voice Recording
1. Navigate to any chat interface
2. Click the microphone icon 🎙️
3. Allow microphone permission when prompted
4. Speak into your microphone
5. Click the microphone icon again to stop
6. Wait for transcription to complete
7. Transcribed text appears in input field

### 3. Expected Console Logs
```
🎤 Requesting microphone permission...
✅ Microphone permission granted
🎙️ Starting voice recording...
✅ Recording started
⏹️ Stopping voice recording...
🤖 Sending audio to transcription API...
📡 Transcription API response status: 200
✅ Transcription successful: [your speech]
```

## 🔧 API Endpoints

### POST /api/transcribe
- **Purpose**: Transcribe audio using OpenAI Whisper API
- **Input**: Multipart form data with audio file
- **Output**: JSON with transcribed text
- **Max File Size**: 25MB

### GET /api/transcribe/health
- **Purpose**: Check transcription service health
- **Output**: Service status and configuration

## 🎯 Features Implemented

### Frontend (React)
- ✅ **useVoice Hook**: Complete voice recording management
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Loading States**: Visual feedback during processing
- ✅ **Toast Notifications**: Real-time status updates
- ✅ **Microphone Permission**: Graceful permission handling

### Backend (Spring Boot)
- ✅ **TranscriptionController**: OpenAI Whisper API integration
- ✅ **File Upload**: Multer-style multipart handling
- ✅ **Error Handling**: Comprehensive error responses
- ✅ **Security**: CORS and authentication configuration
- ✅ **Logging**: Detailed request/response logging

### User Experience
- ✅ **Visual Indicators**: Recording and processing states
- ✅ **Button States**: Disabled during processing
- ✅ **Modal Overlays**: Recording and transcription feedback
- ✅ **Error Messages**: Specific error handling for common issues

## 🐛 Troubleshooting

### Common Issues

#### 1. Microphone Permission Denied
**Error**: "Microphone access denied"
**Solution**: 
- Check browser settings
- Ensure HTTPS (required for microphone)
- Refresh page and try again

#### 2. OpenAI API Quota Exceeded
**Error**: "API quota exceeded"
**Solution**:
- Add payment method to OpenAI account
- Check API usage in OpenAI dashboard
- Wait for quota reset

#### 3. Backend Connection Failed
**Error**: "Failed to fetch"
**Solution**:
- Ensure backend server is running on port 8080
- Check CORS configuration
- Verify API endpoint is accessible

#### 4. Audio File Too Large
**Error**: "Audio file too large"
**Solution**:
- Record shorter audio clips
- Check file size limits (25MB max)
- Optimize audio quality settings

### Debug Steps

1. **Check Console Logs**:
   - Open browser dev tools (F12)
   - Look for error messages in console
   - Check network tab for API requests

2. **Verify API Key**:
   - Ensure OpenAI API key is set correctly
   - Test API key with OpenAI dashboard
   - Check backend logs for authentication errors

3. **Test Backend Health**:
   - Visit http://localhost:8080/api/transcribe/health
   - Check if service is running
   - Verify OpenAI configuration

## 📝 TODO Items

### Manual Configuration Required
1. **Set OpenAI API Key**:
   - Replace `your_openai_api_key_here` in `.env` files
   - Get key from https://platform.openai.com/

2. **Update Firebase Config** (if needed):
   - Replace Firebase configuration in `.env`
   - Get config from Firebase console

3. **Production Deployment**:
   - Update CORS origins for production domain
   - Set up HTTPS for microphone access
   - Configure production OpenAI API limits

### Optional Enhancements
- [ ] Add audio format conversion
- [ ] Implement audio compression
- [ ] Add transcription confidence scores
- [ ] Support multiple languages
- [ ] Add audio playback before sending

## 🎉 Success Criteria

The voice chat feature is working correctly when:
- ✅ Microphone permission is granted
- ✅ Audio recording starts and stops properly
- ✅ Audio is sent to backend API
- ✅ OpenAI Whisper API transcribes audio
- ✅ Transcribed text appears in chat input
- ✅ Error messages are user-friendly
- ✅ Loading states are visible during processing

## 📞 Support

If you encounter issues:
1. Check console logs for specific errors
2. Verify all environment variables are set
3. Test backend health endpoint
4. Check OpenAI API key and quota
5. Ensure microphone permissions are granted
