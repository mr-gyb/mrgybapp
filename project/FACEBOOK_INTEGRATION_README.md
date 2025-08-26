# 🎯 Facebook Integration - Complete Setup Guide

This guide will help you set up Facebook account login and post creation directly from your GYB application.

## 🚀 Features

- **🔐 Facebook OAuth Authentication** - Secure login with user permissions
- **📝 Direct Post Creation** - Upload text, images, and links to Facebook
- **📊 User Profile Management** - Access user information and permissions
- **🔗 Page Management** - Connect and manage Facebook pages
- **📱 Responsive UI** - Works on all devices
- **🔄 Real-time Updates** - Live connection status and data

## 📋 Prerequisites

1. **Facebook Developer Account** - [Create one here](https://developers.facebook.com/)
2. **Existing Facebook App** - You mentioned you already have one configured with Firebase
3. **Environment Variables** - Configure your app credentials

## ⚙️ Setup Instructions

### 1. Facebook App Configuration

#### Update Your Existing Facebook App:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your existing app
3. Add **Facebook Login** product if not already added
4. Configure OAuth redirect URIs:
   - **Development**: `http://localhost:3002/facebook-callback`
   - **Production**: `https://yourdomain.com/facebook-callback`

#### Required App Permissions:
```
- email
- public_profile
- pages_manage_posts
- pages_read_engagement
- pages_show_list
- publish_to_groups
- user_posts
```

### 2. Environment Configuration

#### Copy Environment Template:
```bash
cp env-facebook-template.txt .env
```

#### Update Your .env File:
```env
# Facebook Integration
VITE_FACEBOOK_APP_ID=123456789012345
VITE_FACEBOOK_APP_SECRET=abcdef123456789abcdef123456789ab

# Keep your existing variables
VITE_OPENAI_API_KEY=your_openai_key_here
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3002/callback
```

### 3. App Review (Production Use)

For production use, some permissions require Facebook App Review:
- `pages_manage_posts` - Posting to pages
- `publish_to_groups` - Posting to groups
- `user_posts` - Posting to personal profile

**Development Mode**: Allows testing with limited users (up to 25)

## 🔧 Technical Implementation

### Components Created:
- `FacebookCallback.tsx` - OAuth callback handler
- Enhanced `FacebookIntegration.tsx` - Main integration interface
- Enhanced `facebookIntegration.service.ts` - Core service logic

### Routes Added:
- `/facebook-callback` - OAuth callback endpoint
- `/settings/integrations/facebook` - Integration management

### Service Features:
- **SDK Initialization** - Automatic Facebook SDK loading
- **Token Management** - Secure storage and refresh
- **Permission Checking** - Real-time permission validation
- **Post Upload** - Direct content publishing
- **Error Handling** - Comprehensive error management

## 📱 Usage Guide

### 1. Access Facebook Integration

Navigate to: **Settings → Manage Integration → Facebook Login**

### 2. Connect Your Account

#### Option A: Automatic Login (Recommended)
1. Click **"Connect Facebook"** button
2. Authorize in Facebook popup
3. Grant required permissions
4. Return to integration page

#### Option B: Manual OAuth
1. Click **"🔗 Manual Auth"** button
2. Complete Facebook OAuth in new tab
3. Return to callback URL
4. Complete authentication

### 3. Create Posts

1. Go to **"Create Post"** tab
2. Write your message
3. Add images (optional)
4. Set privacy level
5. Click **"Post to Facebook"**

### 4. Manage Connection

- **View Profile**: See connected account details
- **Check Permissions**: View granted permissions
- **Disconnect**: Remove Facebook connection
- **Refresh Data**: Update connection status

## 🔍 Troubleshooting

### Common Issues:

#### 1. "Facebook App ID not configured"
**Solution**: Check your `.env` file and ensure `VITE_FACEBOOK_APP_ID` is set

#### 2. "OAuth redirect URI mismatch"
**Solution**: Verify redirect URI in Facebook App matches your callback URL

#### 3. "Permission denied"
**Solution**: Ensure user grants all required permissions during login

#### 4. "SDK failed to load"
**Solution**: Check internet connection and Facebook SDK availability

### Debug Information:

Check browser console for detailed logs:
```
🎯 Attempting Facebook login with enhanced scopes...
📋 Requesting scopes: email,public_profile,pages_manage_posts...
📱 Facebook login response: {status: "connected"}
✅ Facebook login successful!
👤 User ID: 123456789
🔑 Access Token: Received
```

## 🔒 Security Considerations

### Token Storage:
- Access tokens stored in `localStorage`
- No server-side token storage
- Tokens expire automatically

### Permission Scope:
- Minimal required permissions
- User consent required for each permission
- Easy permission revocation

### Data Privacy:
- Only posts user explicitly creates
- No automatic data collection
- User controls all content

## 📊 API Endpoints Used

### Facebook Graph API v18.0:
- `GET /me` - User profile information
- `GET /me/permissions` - User permissions
- `GET /me/accounts` - User's Facebook pages
- `POST /me/feed` - Create post on personal profile
- `POST /{page-id}/feed` - Create post on page

### OAuth Endpoints:
- `https://www.facebook.com/v18.0/dialog/oauth` - Authorization
- `/facebook-callback` - Callback handler

## 🚀 Next Steps

### Immediate:
1. ✅ Configure environment variables
2. ✅ Test connection in development
3. ✅ Create your first post

### Future Enhancements:
- [ ] Post scheduling
- [ ] Analytics dashboard
- [ ] Bulk post management
- [ ] Content templates
- [ ] Engagement tracking

## 📞 Support

If you encounter issues:

1. **Check Console Logs** - Detailed error information
2. **Verify Configuration** - App ID, Secret, and redirect URIs
3. **Test Permissions** - Ensure all required permissions are granted
4. **Check Facebook Status** - Verify Facebook services are operational

## 🔗 Useful Links

- [Facebook Developers](https://developers.facebook.com/)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Graph API Reference](https://developers.facebook.com/docs/graph-api/)
- [App Review Guidelines](https://developers.facebook.com/docs/app-review/)

---

**🎉 Congratulations!** You now have a fully functional Facebook integration that allows users to connect their accounts and post directly from your application.
