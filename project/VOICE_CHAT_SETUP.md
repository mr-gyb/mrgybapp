# Voice Chat Setup Guide

## Quick Fix for Voice Chat Feature

### 1. Environment Setup

Create a `.env` file in the project root with the following content:

```env
# OpenAI API Configuration (REQUIRED for voice chat)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Firebase Configuration (if not already set)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 2. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and replace `your_openai_api_key_here` in your `.env` file

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Test Voice Chat

1. Open your browser to the development server (usually http://localhost:5173)
2. Navigate to any chat interface
3. Click the microphone icon
4. Allow microphone permission when prompted
5. Speak into your microphone
6. Click the microphone icon again to stop recording
7. The transcribed text should appear in the input field

### 6. Troubleshooting

#### If microphone permission is denied:
- Check browser settings
- Make sure you're using HTTPS (required for microphone access)
- Try refreshing the page

#### If transcription fails:
- Check console for error messages
- Verify your OpenAI API key is correct
- Check your internet connection

#### If the app doesn't start:
- Make sure all environment variables are set
- Check that all dependencies are installed
- Look for any console errors

### 7. Browser Requirements

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Limited support (may need HTTPS)
- **Mobile**: Limited support

### 8. Features

- ✅ High-quality audio recording
- ✅ OpenAI Whisper API transcription
- ✅ Real-time feedback
- ✅ Error handling
- ✅ Toast notifications
- ✅ Visual recording indicators

### 9. Console Logging

The implementation includes detailed console logging. Open browser dev tools (F12) to see:
- Microphone permission status
- Recording start/stop events
- Audio processing details
- API request/response logs
- Error messages with details

### 10. Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your OpenAI API key is valid
3. Ensure microphone permissions are granted
4. Check that you're using a supported browser
