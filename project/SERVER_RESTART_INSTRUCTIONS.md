# Server Restart Instructions - Fix 404 Error

## Problem
The `/api/descript/upload` endpoint returns 404 even though it exists in the code. This means the server needs to be restarted to register the route.

## Quick Fix

### Option 1: Restart Server Manually

1. **Stop the current server:**
   - If running in terminal: Press `Ctrl+C`
   - Or find and kill the process:
     ```bash
     lsof -ti:8080 | xargs kill
     ```

2. **Restart the server:**
   ```bash
   cd backend
   npm start
   # OR if using nodemon:
   npm run dev
   ```

### Option 2: Use Restart Script

```bash
cd backend
./restart-server.sh
```

## Verification

After restarting, you should see in the console:

```
✅ OpenAI video service loaded successfully
📹 OpenAI Video Analysis endpoint: http://localhost:8080/api/descript/upload (Whisper + GPT-4/4o)
🏥 Health check: http://localhost:8080/api/descript/upload/health
✅ Verified: POST /api/descript/upload is registered
✅ All endpoints registered. Server ready to accept requests.
```

## Test the Endpoint

You can test if the endpoint is working:

```bash
# Health check
curl http://localhost:8080/api/descript/upload/health

# Should return:
# {"success":true,"message":"Video upload endpoint is available",...}
```

## If Still Getting 404

1. **Check server logs** for any errors during startup
2. **Verify the route** is in `backend/server.js` at line 3528
3. **Check port** - Make sure server is running on port 8080
4. **Check for errors** - Look for "❌ Failed to load OpenAI video service" in logs

## Common Issues

### Issue: Module not found
**Solution:** Make sure `backend/openaiVideoService.js` exists and is valid

### Issue: Port already in use
**Solution:** 
```bash
lsof -ti:8080 | xargs kill
npm start
```

### Issue: Route not registered
**Solution:** Check that the route is defined BEFORE `app.listen()` in server.js

