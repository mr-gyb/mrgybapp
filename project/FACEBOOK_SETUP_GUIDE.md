# Facebook Authentication Setup Guide

## 🚨 **Current Issue**
The Facebook login is showing a loading state instead of pulling up the Facebook login page. This is because the Firebase configuration is missing required environment variables.

## 🔧 **Quick Fix for Development**

### **Option 1: Use Development Mode (Immediate)**
1. Click the Facebook icon in the "Create Social Media" modal
2. In the Facebook Login Modal, click the **"🧪 Development Mode - Simulate Connection"** button
3. This will simulate a successful connection for testing the UI flow

### **Option 2: Set Up Proper Facebook Authentication (Recommended)**

## 📋 **Required Setup Steps**

### **1. Create a .env file in your project root**
```bash
# Copy env-template.txt to .env and fill in your values
cp env-template.txt .env
```

### **2. Get Firebase Configuration**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one)
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Copy the config values:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### **3. Enable Facebook Authentication in Firebase**
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Facebook** provider
3. Enable it and add your Facebook App ID and App Secret
4. Add your domain to authorized domains

### **4. Create Facebook App (if you don't have one)**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs:
   - `http://localhost:3002/__/auth/handler` (for development)
   - `https://yourdomain.com/__/auth/handler` (for production)

### **5. Update .env with Facebook App details**
```env
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret
```

## 🧪 **Testing the Setup**

### **After completing the setup:**
1. Restart your development server
2. Click the Facebook icon in "Create Social Media"
3. Click "Continue with Facebook"
4. You should now see the actual Facebook login page

### **If still not working:**
1. Check browser console for errors
2. Verify all environment variables are set
3. Ensure Firebase project has Facebook auth enabled
4. Check that your domain is authorized in Facebook app

## 🔍 **Troubleshooting**

### **Common Issues:**
- **"Firebase configuration is missing"**: Check your .env file
- **"Facebook authentication failed"**: Verify Facebook app configuration
- **"Invalid OAuth redirect URI"**: Check Facebook app settings
- **CORS errors**: Ensure localhost:3002 is in authorized domains

### **Debug Steps:**
1. Check browser console for error messages
2. Verify environment variables are loaded (check Network tab)
3. Test Firebase connection in browser console
4. Check Firebase Authentication logs

## 📱 **What Happens After Successful Setup**

1. **User clicks Facebook icon** → Facebook Login Modal appears
2. **User clicks "Continue with Facebook"** → Facebook's official login page opens
3. **User authenticates** → Account connects to GYB Studio
4. **User can now:**
   - Upload posts directly to Facebook
   - Schedule posts for optimal timing
   - Track performance and engagement
   - Manage multiple Facebook pages

## 🆘 **Need Help?**

If you're still experiencing issues:
1. Check the browser console for specific error messages
2. Verify all environment variables are properly set
3. Ensure Firebase project has Facebook authentication enabled
4. Check Facebook app configuration and permissions

The development mode button will help you test the UI flow while you work on the authentication setup.
