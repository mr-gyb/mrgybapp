# AI Endpoint Configuration

## Environment Variables

The AI endpoint is configured using environment variables in priority order:

### Priority 1: `VITE_AI_API_URL` (Recommended for Production)
```bash
VITE_AI_API_URL=https://api.yourdomain.com
```

### Priority 2: `REACT_APP_AI_API_URL` (Alternative)
```bash
REACT_APP_AI_API_URL=https://api.yourdomain.com
```

### Priority 3: `VITE_CHAT_API_BASE` (Fallback)
```bash
VITE_CHAT_API_BASE=https://api.yourdomain.com/api
```

### Priority 4: `localhost:8080` (Development Only)
- Only used when `import.meta.env.DEV === true`
- Never used in production builds

## Configuration Examples

### Production (.env.production)
```bash
VITE_AI_API_URL=https://ai.mrgyb.com
```

### Development (.env.local)
```bash
# Optional - will use localhost:8080 if not set
VITE_AI_API_URL=http://localhost:8080
```

## Behavior

1. **ENV URL First**: Always tries ENV-based URLs first
2. **Dev Fallback**: Only uses localhost in development mode
3. **Graceful Degradation**: If no endpoint is available:
   - Logs warning: "⚠️ No AI endpoint configured"
   - Skips AI response gracefully
   - Group chat continues working normally
   - Human messages still send successfully

4. **Error Handling**:
   - 404 errors → Skip AI, continue chat
   - Network errors → Skip AI, continue chat
   - All errors → Skip AI, continue chat
   - Never blocks message sending

## Console Logs

You'll see one of these logs when the app starts:
- `✅ Using AI Endpoint: <url> (from VITE_AI_API_URL)`
- `✅ Using AI Endpoint: <url> (from VITE_CHAT_API_BASE)`
- `✅ Using AI Endpoint: http://localhost:8080 (localhost - dev mode only)`
- `⚠️ No AI endpoint configured. Set VITE_AI_API_URL or VITE_CHAT_API_BASE in production.`

## Testing

1. **Test with ENV variable**:
   ```bash
   VITE_AI_API_URL=http://localhost:8080 npm run dev
   ```

2. **Test without ENV (dev mode)**:
   ```bash
   npm run dev
   # Should use localhost:8080 automatically
   ```

3. **Test production build**:
   ```bash
   VITE_AI_API_URL=https://api.yourdomain.com npm run build
   ```

## Important Notes

- ✅ AI failures never block human messages
- ✅ No hardcoded localhost URLs in production
- ✅ Clear console logs for debugging
- ✅ Graceful degradation when AI is offline

