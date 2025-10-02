# OpenAI API Troubleshooting Guide

## Common Issues and Solutions

### 1. "OpenAI API connection failed" Error

This error occurs when the API key is not properly configured or there are connection issues.

#### Check Your API Key

1. **Verify API Key Format**
   - Should start with `sk-`
   - Should be 51 characters long
   - Example: `sk-1234567890abcdef...`

2. **Check Environment File**
   - Ensure `.env` file exists in project root
   - Verify the key is set correctly:
   ```env
   VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Restart Development Server**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

#### Get a Valid API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Click "Create new secret key"
5. Copy the key and add to `.env` file

### 2. Authentication Errors (401)

**Error**: `Authentication failed - check your API key`

**Solutions**:
- Verify API key is correct
- Check if key has expired
- Ensure no extra spaces in `.env` file
- Regenerate API key if needed

### 3. Rate Limit Errors (429)

**Error**: `Rate limit exceeded - try again later`

**Solutions**:
- Wait a few minutes before retrying
- Check your OpenAI usage limits
- Consider upgrading your OpenAI plan

### 4. Permission Errors (403)

**Error**: `Access forbidden - check your API key permissions`

**Solutions**:
- Verify API key has correct permissions
- Check if your OpenAI account is active
- Ensure you have sufficient credits

### 5. Network/CORS Errors

**Error**: `This might be a network issue or CORS problem`

**Solutions**:
- Check internet connection
- Try a different network
- Clear browser cache
- Check if firewall is blocking requests

## Debug Steps

### Step 1: Check Console Logs

Open browser console (F12) and look for:
- API key existence
- API key format
- Connection test results
- Detailed error messages

### Step 2: Verify Environment Variables

1. Check if `.env` file exists in project root
2. Verify the key format:
   ```env
   VITE_OPENAI_API_KEY=sk-your-key-here
   ```
3. No quotes around the key
4. No spaces before/after the key

### Step 3: Test API Key Manually

You can test your API key using curl:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.openai.com/v1/models
```

### Step 4: Check OpenAI Account

1. Log into [OpenAI Platform](https://platform.openai.com/)
2. Check API usage and limits
3. Verify account status
4. Check billing information

## Quick Fixes

### Fix 1: Regenerate API Key
1. Go to OpenAI Platform
2. Delete old API key
3. Create new API key
4. Update `.env` file
5. Restart development server

### Fix 2: Check File Location
Ensure `.env` file is in the correct location:
```
project/
├── .env                    ← Should be here
├── src/
├── package.json
└── ...
```

### Fix 3: Clear Cache
```bash
# Clear npm cache
npm cache clean --force

# Clear node_modules
rm -rf node_modules
npm install

# Restart development server
npm run dev
```

## Testing Your Setup

### Test 1: Environment Variables
```javascript
console.log('API Key exists:', !!import.meta.env.VITE_OPENAI_API_KEY);
console.log('API Key format:', import.meta.env.VITE_OPENAI_API_KEY?.startsWith('sk-'));
```

### Test 2: API Connection
The app will automatically test the connection and show results in console.

### Test 3: Manual API Call
Use the browser console to test:
```javascript
fetch('https://api.openai.com/v1/models', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => console.log('Status:', response.status))
.catch(error => console.error('Error:', error));
```

## Still Having Issues?

1. **Check OpenAI Status**: Visit [status.openai.com](https://status.openai.com/)
2. **Contact Support**: Use OpenAI support channels
3. **Check Documentation**: [OpenAI API Docs](https://platform.openai.com/docs)
4. **Verify Account**: Ensure your OpenAI account is active and has credits

## Common Mistakes

❌ **Wrong file location**: `.env` not in project root
❌ **Wrong variable name**: Should be `VITE_OPENAI_API_KEY`
❌ **Extra spaces**: `VITE_OPENAI_API_KEY = sk-...` (wrong)
❌ **Quotes around key**: `VITE_OPENAI_API_KEY="sk-..."` (wrong)
❌ **Forgot to restart**: Server needs restart after `.env` changes
❌ **Invalid key**: Using old or incorrect API key

✅ **Correct format**:
```env
VITE_OPENAI_API_KEY=sk-1234567890abcdef1234567890abcdef1234567890abcdef
```
