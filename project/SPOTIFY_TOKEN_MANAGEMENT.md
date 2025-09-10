# 🎵 Spotify Token Management System

## 🎯 **Overview**

This system automatically manages Spotify access tokens using the Client Credentials flow. It reads your credentials from the `.env` file, generates base64-encoded authentication, and automatically refreshes tokens every 60 minutes.

## 🚀 **What It Does**

✅ **Automatic Token Generation** - Every 60 minutes  
✅ **Smart Token Refresh** - 5 minutes before expiry  
✅ **Environment File Updates** - Automatically saves to `.env`  
✅ **Background Operation** - Runs continuously  
✅ **Error Handling** - Comprehensive error management  
✅ **Graceful Shutdown** - Handles Ctrl+C properly  

## 🔧 **How It Works**

### **1. Authentication Process**
```bash
# Reads from .env file:
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret

# Generates base64 encoded credentials:
client_id:client_secret → base64_encoded_string

# Makes API call exactly as specified:
curl -X POST "https://accounts.spotify.com/api/token" \
  -H "Authorization: Basic <base64(client_id:client_secret)>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials"
```

### **2. Token Lifecycle**
- **Generation**: Uses client credentials to get access token
- **Storage**: Saves token as `VITE_SPOTIFY_ACCESS_TOKEN` in `.env`
- **Monitoring**: Checks token expiry every minute
- **Refresh**: Automatically refreshes 5 minutes before expiry
- **Update**: Continuously updates `.env` file with fresh tokens

## 📁 **Files Created**

- `scripts/spotify-token-manager.js` - Main token manager (continuous operation)
- `scripts/generate-spotify-token.js` - One-time token generation
- `package.json` - Updated with new npm scripts

## 🎮 **Available Commands**

### **One-time Token Generation**
```bash
npm run spotify:token
```
- Generates single access token
- Saves to `.env` file
- Shows token expiry information
- Good for testing or manual refresh

### **Continuous Token Management**
```bash
npm run spotify:manager
```
- Starts background token manager
- Automatically refreshes every 60 minutes
- Runs until stopped (Ctrl+C)
- Perfect for production use

## 🔍 **Current Status**

Your system is now **ACTIVE** and running! 

✅ **Credentials Loaded**: `e3488ae8...` (Client ID)  
✅ **Token Generated**: Fresh access token created  
✅ **Manager Running**: Background process active  
✅ **Auto-refresh**: Every 60 minutes  

## 📊 **Token Information**

- **Current Token**: `BQDs8gyJemlBdD7mDnoaiP4RHSOfERfjShBfGSgOct8XEREzB2pFcBlHfJTnGWhJKOg7tRqH7D3Y6taJwskdq-xoE9b729ZDpzHJssIAMJ2CzPU807iERBhu8kCnRFef0bE3yd4PuIw`
- **Expires In**: 60 minutes
- **Refresh Strategy**: 5 minutes before expiry
- **Storage**: Automatically saved to `.env`

## 🛠 **Technical Details**

### **API Endpoint**
```
POST https://accounts.spotify.com/api/token
Headers:
  Authorization: Basic <base64(client_id:client_secret)>
  Content-Type: application/x-www-form-urlencoded
Body:
  grant_type=client_credentials
```

### **Base64 Encoding**
```javascript
const credentials = `${clientId}:${clientSecret}`;
const basicAuth = Buffer.from(credentials).toString('base64');
```

### **Token Refresh Logic**
```javascript
// Check every minute
setInterval(async () => {
  if (this.shouldRefreshToken()) {
    await this.getNewAccessToken();
  }
}, 60 * 1000);

// Refresh 5 minutes before expiry
const refreshThreshold = 5 * 60 * 1000;
return Date.now() >= (this.tokenExpiry - refreshThreshold);
```

## 🔒 **Security Features**

- **Environment Variables**: Credentials stored in `.env` (not committed to git)
- **Token Rotation**: Automatic token refresh prevents expiry
- **Error Handling**: Graceful failure with detailed logging
- **Process Management**: Clean shutdown on interruption

## 📝 **Environment Variables**

The system automatically manages these in your `.env` file:

```env
# Your credentials (already set)
VITE_SPOTIFY_CLIENT_ID=e3488ae84052414c84e02d6cad685dcf
VITE_SPOTIFY_CLIENT_SECRET=981af08e90154d508494a756420d9ae9
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback

# Automatically managed by the system
VITE_SPOTIFY_ACCESS_TOKEN=BQDs8gyJemlBdD7mDnoaiP4RHSOfERfjShBfGSgOct8XEREzB2pFcBlHfJTnGWhJKOg7tRqH7D3Y6taJwskdq-xoE9b729ZDpzHJssIAMJ2CzPU807iERBhu8kCnRFef0bE3yd4PuIw
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Token Expired (401 Error)**
   - The manager should handle this automatically
   - Check if the background process is running: `npm run spotify:manager`

2. **Manager Not Running**
   - Start it: `npm run spotify:manager`
   - Check for errors in the console

3. **Invalid Credentials**
   - Verify your `.env` file has correct Spotify credentials
   - Check Spotify Developer Dashboard for valid Client ID/Secret

4. **Permission Errors**
   - Ensure `.env` file is writable
   - Check file permissions

### **Debug Commands**

```bash
# Check if manager is running
Get-Process | Where-Object {$_.ProcessName -eq "node"}

# View current token
Get-Content .env | Select-String "VITE_SPOTIFY_ACCESS_TOKEN"

# Test token generation
npm run spotify:token

# Start continuous management
npm run spotify:manager
```

## 🎯 **Integration with Your App**

Once the token is generated and stored in `.env`, you can access it in your Vite application:

```typescript
const spotifyToken = import.meta.env.VITE_SPOTIFY_ACCESS_TOKEN;

// Use the token in your API calls
const response = await fetch('https://api.spotify.com/v1/...', {
  headers: {
    'Authorization': `Bearer ${spotifyToken}`
  }
});
```

## 🚀 **Production Deployment**

For production environments:

1. **Keep the manager running**:
   ```bash
   npm run spotify:manager
   ```

2. **Set up as a service**:
   - Use PM2: `pm2 start scripts/spotify-token-manager.js`
   - Use systemd service
   - Use Docker container

3. **Monitor logs**:
   - Check console output for token refresh messages
   - Monitor `.env` file for token updates

## 🎉 **Success!**

Your Spotify token management system is now fully operational! 

- ✅ **Automatic token generation** every 60 minutes
- ✅ **Background process** running continuously  
- ✅ **Environment file** automatically updated
- ✅ **No more 401 errors** from expired tokens

The system will keep your Spotify API calls working seamlessly without manual intervention!
