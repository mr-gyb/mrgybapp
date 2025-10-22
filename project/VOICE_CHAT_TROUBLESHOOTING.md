# Voice Chat Troubleshooting Guide

## 🚨 Current Error: 404 Not Found

**Error**: `POST http://localhost:3002/api/transcribe 404 (Not Found)`

**Root Cause**: Frontend is trying to connect to port 3002, but backend is on port 8080.

## 🔧 Quick Fix

### Step 1: Start Backend Server
```bash
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project/backend/demo
./gradlew bootRun
```

**Expected Output**:
```
Started DemoApplication in X.XXX seconds (JVM running for X.XXX)
```

### Step 2: Verify Backend is Running
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

### Step 3: Start Frontend Server
```bash
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project
npm run dev
```

**Expected Output**:
```
  VITE v5.x.x  ready in XXX ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🎯 Test Voice Chat

1. **Open Browser**: http://localhost:5173
2. **Navigate to Chat**: Go to any chat interface
3. **Click Microphone**: Allow permission when prompted
4. **Speak**: Say something into your microphone
5. **Stop Recording**: Click microphone again
6. **Check Console**: Should see successful API calls

## 📊 Expected Console Logs

### Successful Flow:
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

### API Configuration:
- **Frontend**: Uses `API_BASE` from config (http://localhost:8080)
- **Backend**: Runs on port 8080
- **Endpoint**: `/api/transcribe`

## 🐛 Common Issues & Solutions

### Issue 1: Backend Not Running
**Error**: `404 Not Found`
**Solution**: Start backend server with `./gradlew bootRun`

### Issue 2: Wrong Port Configuration
**Error**: `POST http://localhost:3002/api/transcribe 404`
**Solution**: Check that `API_BASE` in config.ts points to port 8080

### Issue 3: CORS Issues
**Error**: `CORS policy: No 'Access-Control-Allow-Origin'`
**Solution**: Backend CORS is configured for localhost:5173

### Issue 4: OpenAI API Key Missing
**Error**: `OpenAI API key not configured`
**Solution**: Set `OPENAI_API_KEY` in backend environment

### Issue 5: Microphone Permission Denied
**Error**: `Microphone access denied`
**Solution**: Allow microphone permission in browser settings

## 🔍 Debug Steps

### 1. Check Backend Health
```bash
curl -X GET http://localhost:8080/api/transcribe/health
```

### 2. Check Frontend API Config
Open browser console and check:
```javascript
console.log('API_BASE:', import.meta.env.VITE_API_BASE);
```

### 3. Test API Endpoint Manually
```bash
curl -X POST http://localhost:8080/api/transcribe \
  -F "audio=@test-audio.webm"
```

### 4. Check Network Tab
- Open browser dev tools (F12)
- Go to Network tab
- Try voice recording
- Look for API requests to port 8080

## 📝 Environment Variables Required

### Frontend (.env):
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Backend (.env or application.yml):
```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 🎯 Success Criteria

Voice chat is working when:
- ✅ Backend responds to health check
- ✅ Frontend connects to correct port (8080)
- ✅ Microphone permission granted
- ✅ Audio recording starts/stops
- ✅ API call returns 200 status
- ✅ Transcription text appears in input

## 🚀 Quick Start Commands

```bash
# Terminal 1 - Backend
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project/backend/demo
./gradlew bootRun

# Terminal 2 - Frontend  
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project
npm run dev

# Terminal 3 - Test
curl http://localhost:8080/api/transcribe/health
```

## 📞 Still Having Issues?

1. **Check Ports**: Ensure 8080 (backend) and 5173 (frontend) are free
2. **Check Logs**: Look at backend console for errors
3. **Check Browser**: Open dev tools and check console/network tabs
4. **Check API Key**: Verify OpenAI API key is set correctly
5. **Restart Services**: Stop and restart both frontend and backend
