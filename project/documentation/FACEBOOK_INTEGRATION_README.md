# Facebook Integration Setup Guide

This guide explains how to set up Facebook integration to allow users to upload posts directly from their personal Facebook accounts.

## 🚀 **Features**

- **Direct Facebook Login**: Users can connect their personal Facebook accounts
- **Post Upload**: Upload posts directly to Facebook profiles or pages
- **Account Management**: Manage multiple Facebook pages and personal profiles
- **Privacy Controls**: Set privacy settings for each post
- **Secure Authentication**: OAuth-based authentication with Facebook

## 📋 **Prerequisites**

1. **Facebook Developer Account**: You need a Facebook Developer account
2. **Facebook App**: Create a Facebook app in the Developer Console
3. **Environment Variables**: Configure your app credentials

## 🔧 **Setup Instructions**

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App" and select "Consumer" or "Business"
3. Fill in your app details
4. Note down your **App ID** and **App Secret**

### 2. Configure Facebook App

1. In your Facebook app dashboard, go to **Settings > Basic**
2. Add your domain to **App Domains**
3. Add your redirect URI: `https://yourdomain.com/facebook-callback`
4. Go to **Facebook Login > Settings**
5. Add your redirect URI to **Valid OAuth Redirect URIs**

### 3. Environment Variables

Create or update your `.env` file:

```env
VITE_FACEBOOK_APP_ID=your_facebook_app_id_here
VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret_here
```

### 4. Facebook Login Permissions

Your app will request these permissions:
- `email` - User's email address
- `public_profile` - Basic profile information
- `publish_actions` - Post to user's timeline
- `pages_manage_posts` - Post to pages the user manages
- `pages_read_engagement` - Read page insights

## 🎯 **User Flow**

### **Path 1: From Content Category Selector**
1. User selects "Social Media" category
2. Clicks on Facebook icon (blue "f" button)
3. Facebook integration modal opens
4. User connects Facebook account
5. User can upload posts directly

### **Path 2: From Settings**
1. User goes to **Settings → Manage Integration → Facebook Login**
2. Facebook integration manager opens
3. User connects Facebook account
4. User can manage integration and upload posts

## 🔐 **Security Features**

- **OAuth 2.0**: Secure authentication flow
- **Token Storage**: Access tokens stored in localStorage (consider server-side storage for production)
- **Permission Scoping**: Only requests necessary permissions
- **Secure API Calls**: All Facebook API calls use HTTPS
- **Token Validation**: Automatic token validation and refresh

## 📱 **Component Architecture**

```
ContentCategorySelector
├── Social Media Icons
│   └── Facebook Icon (Clickable)
│       └── FacebookIntegrationManager
│           ├── Login/Logout
│           ├── Account Management
│           └── Post Upload Form

IntegrationsSettings
├── Settings → Manage Integration
│   └── Facebook Integration
│       └── FacebookIntegrationManager
```

## 🛠 **Technical Implementation**

### **Services**
- `facebookIntegration.service.ts` - Core Facebook API integration
- Handles authentication, post uploads, and account management

### **Components**
- `FacebookIntegrationManager.tsx` - Main integration interface
- `IntegrationsSettings.tsx` - Settings page for integrations
- `ContentCategorySelector.tsx` - Updated with Facebook integration

### **Types**
- `facebook.ts` - TypeScript interfaces for Facebook data

## 📊 **API Endpoints Used**

- **Authentication**: Facebook Login SDK
- **User Profile**: `GET /me` with access token
- **User Pages**: `GET /me/accounts` with access token
- **Post Upload**: `POST /{user-id}/feed` with access token

## 🚨 **Error Handling**

The integration handles various error scenarios:
- **Network Errors**: Retry mechanisms and user-friendly messages
- **Authentication Errors**: Automatic logout and re-authentication prompts
- **Permission Errors**: Clear messaging about required permissions
- **API Rate Limits**: Graceful degradation and user notifications

## 🔄 **State Management**

- **Integration Status**: Tracks connection state and permissions
- **User Accounts**: Manages personal profile and business pages
- **Post Data**: Handles post creation and upload state
- **Error States**: Manages various error conditions

## 🎨 **UI/UX Features**

- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Clear feedback during operations
- **Success Messages**: Confirmation of successful actions
- **Error Display**: User-friendly error messages
- **Modal Dialogs**: Clean, focused interfaces

## 📝 **Usage Examples**

### **Connect Facebook Account**
```typescript
// User clicks Facebook icon
const handleFacebookClick = () => {
  setShowFacebookIntegration(true);
};

// Facebook integration modal opens
<FacebookIntegrationManager
  onClose={() => setShowFacebookIntegration(false)}
  onPostUploaded={handlePostUploaded}
/>
```

### **Upload Post to Facebook**
```typescript
const postData = {
  message: "Hello from GYB Studio!",
  privacy: "EVERYONE",
  image: selectedImageFile
};

const postId = await facebookIntegrationService.uploadPost(postData);
```

## 🚀 **Future Enhancements**

- **Scheduled Posts**: Schedule posts for future publication
- **Analytics**: Track post performance and engagement
- **Bulk Upload**: Upload multiple posts at once
- **Content Templates**: Pre-defined post templates
- **Cross-Platform**: Extend to Instagram and other platforms

## 🐛 **Troubleshooting**

### **Common Issues**

1. **"App not configured" error**
   - Check your Facebook App ID in environment variables
   - Verify app domain configuration

2. **"Invalid redirect URI" error**
   - Ensure redirect URI matches exactly in Facebook app settings
   - Check for trailing slashes or protocol mismatches

3. **"Permissions not granted" error**
   - User must approve all requested permissions
   - Check Facebook app review status

4. **"Token expired" error**
   - Tokens automatically refresh
   - User may need to re-authenticate

### **Debug Mode**

Enable debug logging by setting:
```typescript
console.log('Facebook integration debug:', {
  appId: import.meta.env.VITE_FACEBOOK_APP_ID,
  status: await facebookIntegrationService.getLoginStatus()
});
```

## 📚 **Additional Resources**

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Facebook Graph API Reference](https://developers.facebook.com/docs/graph-api/)
- [Facebook App Review Process](https://developers.facebook.com/docs/app-review/)
- [OAuth 2.0 Security Best Practices](https://oauth.net/2/oauth-best-practice/)

## 🤝 **Support**

For technical support or questions about the Facebook integration:
1. Check this README for common solutions
2. Review Facebook Developer documentation
3. Check browser console for error messages
4. Verify environment variable configuration

---

**Note**: This integration is designed for development and testing. For production use, consider implementing server-side token storage and additional security measures.
