# OpenAI Quota Error Handling Implementation

## Overview
This document describes the quota-safe error handling system implemented for OpenAI API calls in the chat and voice features. The system detects quota errors, provides user-friendly error messages, implements automatic fallback to cheaper models, and disables UI elements during quota errors.

## Files Changed

### Backend (`project/backend/server.js`)
1. **Quota Detection Functions**:
   - `isQuotaError()`: Detects quota-related errors (429 status, insufficient_quota type/code, quota-related messages)
   - `extractRetryAfter()`: Extracts retry-after information from headers or error messages

2. **Enhanced Error Response**:
   - `sendChatError()`: Returns structured JSON for quota errors:
     ```json
     {
       "ok": false,
       "errorType": "quota",
       "status": 429,
       "code": "insufficient_quota",
       "message": "OpenAI quota temporarily exceeded...",
       "retryAfter": <seconds>,
       "requestId": "..."
     }
     ```

3. **Model Fallback System**:
   - Automatically falls back from primary model (e.g., `gpt-4o`) to fallback model (e.g., `gpt-4o-mini`) on quota errors
   - Controlled by `ENABLE_MODEL_FALLBACK` env var (default: true)
   - Logs fallback attempts for debugging

4. **Enhanced Logging**:
   - Specific log entries for quota errors: `[chat] request.quota_error`
   - Includes error type, code, model, and retry information

5. **Transcription Endpoint**:
   - Updated `/api/transcribe` to detect and return quota errors in the same structured format

### Frontend (`project/src/api/services/chat.service.ts`)
1. **Quota Error Detection**:
   - Detects quota errors from backend responses (429 status, errorType: 'quota', insufficient_quota code)
   - Logs quota errors with `[chat] quota error` prefix

2. **Error Propagation**:
   - `ChatApiError` includes quota error metadata (errorType, retryAfter)
   - `generateAIResponse()` properly categorizes quota errors in diagnostics

### Frontend (`project/src/contexts/ChatContext.tsx`)
1. **Quota Error State**:
   - New `quotaError` state: `{ retryAfter?: number; message: string } | null`
   - Auto-clears after `retryAfter` seconds (or 60s default)

2. **Error Handling**:
   - Detects quota errors from AI response diagnostics
   - Sets quota error state with retry information
   - Clears quota error on successful requests

### Frontend (`project/src/components/Chat.tsx`)
1. **Quota Error Banner**:
   - Displays red banner when quota error is active
   - Shows error message and retry-after countdown
   - Positioned above retry banner (quota errors take priority)

### Frontend (`project/src/components/chat/MessageInput.tsx`)
1. **UI Disabling**:
   - Input field disabled during quota errors
   - Send button disabled during quota errors
   - Microphone button disabled during quota errors
   - Placeholder text changes to "AI quota exceeded. Please wait..."

## Environment Variables

### Backend
- `FALLBACK_MODEL`: Model to use when primary model hits quota (default: `gpt-4o-mini`)
- `ENABLE_MODEL_FALLBACK`: Enable/disable automatic fallback (default: `true`)

### Example `.env`:
```env
MODEL_NAME=gpt-4o
FALLBACK_MODEL=gpt-4o-mini
ENABLE_MODEL_FALLBACK=true
```

## How It Works

### Flow Diagram
```
User sends message
    ↓
Backend tries primary model (e.g., gpt-4o)
    ↓
Quota error? → Yes → Try fallback model (e.g., gpt-4o-mini)
    ↓                    ↓
Success              Still quota error?
    ↓                    ↓
Stream response      Return structured quota error
    ↓                    ↓
Frontend receives    Frontend detects quota error
    ↓                    ↓
Display response     Set quotaError state
                     Disable UI elements
                     Show quota error banner
                     Auto-clear after retryAfter seconds
```

### Error Detection
1. **Backend** checks for:
   - HTTP status 429
   - `error.type === 'insufficient_quota'`
   - `error.code === 'insufficient_quota'`
   - Error message contains "quota", "rate limit", or "billing"

2. **Frontend** checks for:
   - Response status 429
   - `errorBody.errorType === 'quota'`
   - `errorBody.code === 'insufficient_quota'`
   - Diagnostics code `'insufficient_quota'`

## Testing

### Simulating Quota Errors

#### Method 1: Temporarily Use Invalid API Key
1. In backend `.env`, set `OPENAI_API_KEY` to an invalid key
2. Make a chat request
3. You should see a 401 error (not quota, but tests error handling)

#### Method 2: Use Rate-Limited Test Key
1. If you have a test OpenAI account with quota limits, use that key
2. Make multiple rapid requests to exhaust quota
3. Observe quota error handling

#### Method 3: Mock Backend Response (Development)
1. In `backend/server.js`, temporarily modify `handleChatRequest`:
   ```javascript
   // Before making actual request, add:
   if (req.body.messages?.[0]?.content?.includes('test quota')) {
     return sendChatError(res, 429, 'insufficient_quota', 
       'You exceeded your current quota', requestId, {
         errorData: { error: { type: 'insufficient_quota', code: 'insufficient_quota' } },
         retryAfter: 60
       });
   }
   ```
2. Send a message containing "test quota"
3. Observe quota error UI

### Testing Checklist

#### Backend
- [ ] Quota errors return structured JSON with `errorType: 'quota'`
- [ ] Retry-after information is extracted from headers/messages
- [ ] Fallback model is attempted when primary model hits quota
- [ ] Quota errors are logged with `[chat] request.quota_error`
- [ ] Transcription endpoint handles quota errors correctly

#### Frontend
- [ ] Quota errors are detected in `chat.service.ts`
- [ ] `ChatContext` sets `quotaError` state correctly
- [ ] Quota error banner appears in `Chat.tsx`
- [ ] Input field is disabled during quota errors
- [ ] Send button is disabled during quota errors
- [ ] Microphone button is disabled during quota errors
- [ ] Quota error auto-clears after `retryAfter` seconds
- [ ] Console logs show `[chat] quota error` messages

### Manual Testing Steps

1. **Start Backend**:
   ```bash
   cd project/backend
   npm start
   ```

2. **Start Frontend**:
   ```bash
   cd project
   npm run dev
   ```

3. **Test Normal Flow**:
   - Send a message
   - Verify it works normally

4. **Test Quota Error** (using mock method above):
   - Send message: "test quota"
   - Verify:
     - Red quota error banner appears
     - Input field is disabled
     - Send/mic buttons are disabled
     - Error message is clear
     - Retry-after countdown shows (if available)

5. **Test Auto-Clear**:
   - Wait for `retryAfter` seconds (or 60s default)
   - Verify quota error banner disappears
   - Verify UI elements are re-enabled

6. **Test Fallback Model**:
   - Set `MODEL_NAME=gpt-4o` and `FALLBACK_MODEL=gpt-4o-mini`
   - Trigger quota error on primary model
   - Verify backend logs show fallback attempt
   - Verify request succeeds with fallback model (if fallback has quota)

## Console Logging

### Backend Logs
- `[chat] request.quota_error`: Quota error detected
  - Includes: status, model, errorType, errorCode, message, userId, chatId
- `[chat] request.fallback_attempt`: Fallback model attempted
  - Includes: originalModel, fallbackModel, userId, chatId

### Frontend Logs
- `[chat] quota error`: Quota error detected in frontend
  - Includes: status, latencyMs, requestId, retryAfter, errorType

## Error Messages

### User-Facing Messages
- **Quota Error**: "We're currently over the AI usage limit. Please wait a bit and try again."
- **With Retry-After**: "Please wait {retryAfter} seconds before trying again."
- **Input Placeholder**: "AI quota exceeded. Please wait..."
- **Button Tooltips**: "AI quota exceeded. Please wait..."

### Developer Messages
- Backend: Detailed error logs with request IDs
- Frontend: Console errors with diagnostic information

## Best Practices

1. **Always check quota errors first** before other error types
2. **Respect retry-after** information when available
3. **Log quota errors** for monitoring and debugging
4. **Provide clear user feedback** without technical jargon
5. **Auto-recover** when quota is restored (auto-clear after retry-after)

## Troubleshooting

### Quota errors not detected
- Check backend logs for `[chat] request.quota_error`
- Verify error response structure matches expected format
- Check frontend console for `[chat] quota error` logs

### Fallback not working
- Verify `ENABLE_MODEL_FALLBACK=true` in backend `.env`
- Check `FALLBACK_MODEL` is set correctly
- Verify fallback model has quota available

### UI not disabling
- Check `quotaError` state in `ChatContext`
- Verify `MessageInput` receives `quotaError` from context
- Check browser console for React errors

## Future Enhancements

1. **Quota Pre-Check**: Check quota before making requests (if OpenAI provides usage API)
2. **Exponential Backoff**: Implement retry with exponential backoff
3. **Quota Dashboard**: Show quota usage in admin panel
4. **Multiple Fallback Models**: Chain of fallback models (gpt-4o → gpt-4o-mini → gpt-3.5-turbo)
5. **User Notifications**: Toast notifications for quota errors

