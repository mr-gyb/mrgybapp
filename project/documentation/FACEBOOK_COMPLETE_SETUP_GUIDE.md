# Complete Facebook Integration Setup Guide

## 🎯 **Overview**
This guide will walk you through setting up Facebook integration for your GYB app, including all required permissions, app configuration, and testing.

## 📋 **Prerequisites**
- Facebook Developer Account
- Valid domain (for production) or localhost (for development)
- HTTPS enabled (required for Facebook Login)

---

## 🚀 **Step 1: Create Facebook App**

### 1.1 Go to Facebook Developers
- Visit [Facebook Developers Console](https://developers.facebook.com/)
- Click **"Create App"** or **"My Apps"** → **"Create App"**

### 1.2 Choose App Type
- Select **"Consumer"** (for personal Facebook accounts)
- Or **"Business"** (for business pages and ads)
- Click **"Next"**

### 1.3 Fill App Details
- **App Name**: "GYB Studio" (or your preferred name)
- **App Contact Email**: Your email
- **Business Account**: Select if you have one (optional)
- Click **"Create App"**

---

## ⚙️ **Step 2: Configure Facebook App**

### 2.1 Basic Settings
1. Go to **Settings** → **Basic**
2. **App Domains**: Add your domain (e.g., `yourdomain.com`)
3. **Privacy Policy URL**: Add your privacy policy URL
4. **Terms of Service URL**: Add your terms URL
5. **App Icon**: Upload your app icon (1024x1024px recommended)

### 2.2 Facebook Login Setup
1. Go to **Products** → **Facebook Login**
2. Click **"Set Up"**
3. **Platform**: Select **"Web"**
4. **Site URL**: Add your site URL (e.g., `https://yourdomain.com`)
5. **Valid OAuth Redirect URIs**: Add:
   ```
   https://yourdomain.com/facebook-callback
   https://yourdomain.com/settings/integrations/callback
   ```

---

## 🔐 **Step 3: Configure Required Permissions**

### 3.1 App Review → Permissions and Features
1. Go to **App Review** → **Permissions and Features**
2. You'll see a list of permissions that need review

### 3.2 Required Permissions to Add

#### **Basic Permissions (No Review Required)**
- ✅ `email` - User's email address
- ✅ `public_profile` - Basic profile information

#### **Page Management Permissions (Requires App Review)**
- 🔒 `pages_manage_posts` - Post to pages the user manages
- 🔒 `pages_read_engagement` - Read page insights and engagement data
- 🔒 `pages_show_list` - List user's pages (optional, for page selection)

#### **Content Management Permissions**
- 🔒 `publish_actions` - Post to user's timeline (deprecated, but may still be needed)

### 3.3 Permission Details

#### **`pages_manage_posts`**
- **Purpose**: Allow users to post content to their Facebook pages
- **Use Case**: Users can upload posts directly from your app to their pages
- **Review Required**: Yes
- **Review Time**: 1-3 business days

#### **`pages_read_engagement`**
- **Purpose**: Read page insights, post metrics, and engagement data
- **Use Case**: Display analytics and performance metrics in your app
- **Review Required**: Yes
- **Review Time**: 1-3 business days

#### **`pages_show_list`**
- **Purpose**: Access to list of pages the user manages
- **Use Case**: Show users which pages they can post to
- **Review Required**: Yes
- **Review Time**: 1-3 business days

---

## 📝 **Step 4: App Review Process**

### 4.1 Prepare for Review
1. **App Description**: Write clear description of how you'll use each permission
2. **Screenshots**: Provide screenshots of your app using Facebook features
3. **Video Demo**: Create a short video showing the integration
4. **Privacy Policy**: Ensure your privacy policy covers Facebook data usage

### 4.2 Submit for Review
1. Go to **App Review** → **Permissions and Features**
2. Click **"Request"** for each permission
3. Fill out the form with:
   - **Use Case**: How you'll use the permission
   - **User Experience**: How it benefits users
   - **Data Usage**: How you'll handle Facebook data
4. Submit and wait for approval

### 4.3 Development Mode (Temporary)
- While waiting for review, you can test with **Development Mode**
- Only you and added test users can use the app
- Perfect for development and testing

---

## 🔧 **Step 5: Environment Configuration**

### 5.1 Get App Credentials
1. Go to **Settings** → **Basic**
2. Copy your **App ID** and **App Secret**

### 5.2 Update Environment Variables
Create or update your `.env` file:

```env
# Facebook App Configuration
VITE_FACEBOOK_APP_ID=your_app_id_here
VITE_FACEBOOK_APP_SECRET=your_app_secret_here

# Optional: Facebook Page ID (if you have a specific page)
VITE_FACEBOOK_PAGE_ID=your_page_id_here
```

### 5.3 Facebook SDK Configuration
Your app should already have the Facebook SDK configured in `index.html`:

```html
<script>
  window.fbAsyncInit = function() {
    FB.init({
      appId: 'your_app_id_here',
      cookie: true,
      xfbml: true,
      version: 'v18.0'
    });
  };
</script>
```

---

## 🧪 **Step 6: Testing the Integration**

### 6.1 Development Testing
1. **Start your development server**
2. **Clear browser cache** for Facebook
3. **Navigate to Facebook integration** in your app
4. **Click "Connect Facebook"**
5. **Check browser console** for any errors

### 6.2 Test User Accounts
1. Go to **Roles** → **Test Users**
2. **Create Test User** with Facebook account
3. **Add Test User** to your app
4. **Test login** with test user account

### 6.3 Permission Testing
1. **Login with Facebook**
2. **Check granted permissions** in the response
3. **Verify page access** (if using page permissions)
4. **Test posting** (if using `pages_manage_posts`)

---

## 🚨 **Common Issues and Solutions**

### Issue 1: "Invalid Scopes" Error
**Solution**: Ensure you're using the correct permission names from the list above

### Issue 2: "App Not Setup" Error
**Solution**: 
1. Check your App ID is correct
2. Verify Facebook Login is added as a product
3. Ensure your domain is added to App Domains

### Issue 3: "Permission Denied" Error
**Solution**:
1. Check if permissions are approved in App Review
2. Verify user has granted the permissions
3. Check if app is in Development mode

### Issue 4: "Redirect URI Mismatch" Error
**Solution**:
1. Add your exact redirect URI to Valid OAuth Redirect URIs
2. Ensure protocol (http/https) matches exactly
3. Check for trailing slashes

---

## 📱 **Step 7: Production Deployment**

### 7.1 Switch to Live Mode
1. Go to **App Review** → **Make [App Name] public?**
2. Click **"Make Public"**
3. Your app is now live and available to all users

### 7.2 Monitor Usage
1. **App Analytics**: Track app usage and performance
2. **Error Logs**: Monitor for any integration issues
3. **User Feedback**: Collect feedback on Facebook features

---

## 🔒 **Security Best Practices**

### 7.1 Token Management
- **Store tokens securely** (server-side recommended)
- **Implement token refresh** logic
- **Validate tokens** before each API call

### 7.2 Data Privacy
- **Only request necessary permissions**
- **Handle user data according to Facebook's policies**
- **Implement proper data deletion** when users disconnect

### 7.3 Rate Limiting
- **Respect Facebook's API rate limits**
- **Implement exponential backoff** for failed requests
- **Cache data** when possible to reduce API calls

---

## 📊 **Testing Checklist**

- [ ] Facebook app created and configured
- [ ] All required permissions added
- [ ] App Review submitted (if needed)
- [ ] Environment variables configured
- [ ] Facebook SDK loaded correctly
- [ ] Login flow works without errors
- [ ] Permissions granted correctly
- [ ] Page access working (if applicable)
- [ ] Posting functionality working (if applicable)
- [ ] Error handling implemented
- [ ] Production deployment tested

---

## 🆘 **Support Resources**

### Facebook Developer Resources
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Permissions Reference](https://developers.facebook.com/docs/facebook-login/permissions/)
- [App Review Guidelines](https://developers.facebook.com/docs/app-review/)
- [Graph API Reference](https://developers.facebook.com/docs/graph-api/)

### Common Support Channels
- [Facebook Developer Community](https://developers.facebook.com/community/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/facebook-graph-api)
- [Facebook Developer Support](https://developers.facebook.com/support/)

---

## 🎉 **Next Steps**

After completing this setup:

1. **Test thoroughly** with multiple user accounts
2. **Monitor performance** and user engagement
3. **Collect user feedback** on the Facebook integration
4. **Implement additional features** like:
   - Post scheduling
   - Analytics dashboard
   - Multi-page management
   - Content templates

Your Facebook integration should now work correctly with the updated permissions! 🚀
