# 🎤 Voice Chat Quick Start Guide

## ✅ Backend Server is Running!

The backend server is now running on **http://localhost:8080** and responding to requests.

## 🚀 Complete Setup Instructions

### 1. Set OpenAI API Key

**Important**: You need to set your actual OpenAI API key for transcription to work.

#### Option A: Environment Variable (Recommended)
```bash
export OPENAI_API_KEY=your_actual_openai_api_key_here
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project/backend
npm start
```

#### Option B: Create .env file
Create `/Users/darshparikh/Documents/GitHub/mrgybapp/project/backend/.env`:
```env
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 2. Start Frontend Server

```bash
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project
npm run dev
```

### 3. Test Voice Chat

1. **Open Browser**: http://localhost:5173
2. **Navigate to Chat**: Go to any chat interface
3. **Click Microphone**: Allow permission when prompted
4. **Speak**: Say something into your microphone
5. **Stop Recording**: Click microphone again
6. **Check Result**: Transcribed text should appear in input field

## 🎯 Expected Results

### ✅ Successful Flow:
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

### ❌ If OpenAI API Key is Missing:
```
📡 Transcription API response status: 500
❌ Transcription failed: OpenAI API key not configured
```

## 🔧 Troubleshooting

### Issue 1: Backend Not Running
**Solution**: 
```bash
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project/backend
npm start
```

### Issue 2: OpenAI API Key Missing
**Error**: `OpenAI API key not configured`
**Solution**: Set your actual OpenAI API key:
```bash
export OPENAI_API_KEY=sk-your-actual-key-here
```

### Issue 3: Frontend Connection Failed
**Error**: `net::ERR_CONNECTION_REFUSED`
**Solution**: Make sure backend is running on port 8080

### Issue 4: Microphone Permission Denied
**Error**: `Microphone access denied`
**Solution**: Allow microphone permission in browser settings

## 📊 Server Status

### Backend Health Check:
```bash
curl http://localhost:8080/api/transcribe/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "service": "transcription", 
  "openai_configured": true
}
```

### Test Transcription Endpoint:
```bash
curl -X POST http://localhost:8080/api/transcribe \
  -F "audio=@test-audio.webm"
```

## 🎉 Success Criteria

Voice chat is working when:
- ✅ Backend responds to health check (200 OK)
- ✅ Frontend connects to backend (no connection refused)
- ✅ Microphone permission granted
- ✅ Audio recording starts/stops
- ✅ API call returns 200 status
- ✅ Transcription text appears in input field

## 🚀 Quick Commands

```bash
# Terminal 1 - Backend (already running)
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project/backend
export OPENAI_API_KEY=your_actual_key_here
npm start

# Terminal 2 - Frontend
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project
npm run dev

# Terminal 3 - Test
curl http://localhost:8080/api/transcribe/health
```

## 📝 Next Steps

1. **Set your OpenAI API key** (required for transcription)
2. **Start the frontend server** (if not already running)
3. **Test voice chat** in your browser
4. **Check console logs** for any errors

The backend server is ready! Just set your OpenAI API key and you're good to go! 🎤✨
