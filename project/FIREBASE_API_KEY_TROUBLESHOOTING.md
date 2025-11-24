# Firebase API Key Expired - Troubleshooting Guide

## Error Message
```
Firebase: Error (auth/api-key-expired.-please-renew-the-api-key.)
```

This error occurs when your Firebase API key has expired or been restricted.

## Quick Fix Steps

### Step 1: Get a New Firebase API Key

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Select your project

2. **Navigate to Project Settings**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

3. **Get Your Web App Configuration**
   - Scroll down to "Your apps" section
   - If you don't have a web app, click "Add app" → Select Web (</>) icon
   - Copy the configuration values

4. **Update Your .env File**
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...your-new-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

### Step 2: Check API Key Restrictions

1. **Go to Google Cloud Console**
   - Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Select the same project as your Firebase project

2. **Navigate to APIs & Services → Credentials**
   - Find your API key in the list
   - Click on it to edit

3. **Check Application Restrictions**
   - Under "Application restrictions", ensure:
     - For development: "None" or "HTTP referrers" with your localhost URLs
     - For production: "HTTP referrers" with your domain URLs
   
4. **Check API Restrictions**
   - Under "API restrictions", ensure these APIs are enabled:
     - ✅ Identity Toolkit API
     - ✅ Firebase Installations API
     - ✅ Firebase Remote Config API
     - ✅ Cloud Firestore API
     - ✅ Firebase Storage API

### Step 3: Restart Your Development Server

After updating your `.env` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

**Important**: Environment variables are loaded when the server starts, so you must restart after changing them.

### Step 4: Clear Browser Cache

Sometimes cached credentials can cause issues:

1. Open browser DevTools (F12)
2. Go to Application tab → Clear storage
3. Click "Clear site data"
4. Refresh the page

## Alternative: Create a New API Key

If regenerating doesn't work, create a new API key:

1. **In Google Cloud Console → APIs & Services → Credentials**
2. Click "Create Credentials" → "API key"
3. Copy the new key
4. Configure restrictions (see Step 2 above)
5. Update your `.env` file with the new key
6. Restart your development server

## Verify Your Configuration

Check that your `.env` file exists and has correct values:

```bash
# In your project root
cat .env | grep FIREBASE
```

You should see all 6 Firebase variables with actual values (not "your_..._here").

## Common Issues

### Issue: "API key not found"
- **Solution**: Make sure your `.env` file is in the project root (same directory as `package.json`)
- **Solution**: Ensure variable names start with `VITE_` prefix

### Issue: "API key restrictions too strict"
- **Solution**: Temporarily set "Application restrictions" to "None" for testing
- **Solution**: Add `localhost:3002` and `localhost:5173` to HTTP referrers

### Issue: "Required APIs not enabled"
- **Solution**: Go to Google Cloud Console → APIs & Services → Library
- **Solution**: Enable all Firebase-related APIs listed in Step 2

## Still Having Issues?

1. **Check Firebase Console for Project Status**
   - Ensure your Firebase project is active
   - Check if there are any billing issues

2. **Verify Project ID Match**
   - The `VITE_FIREBASE_PROJECT_ID` must match the project ID in Firebase Console

3. **Check Network/Firewall**
   - Ensure you can access `https://console.firebase.google.com/`
   - Check if corporate firewall is blocking Firebase APIs

4. **Review Browser Console**
   - Open DevTools (F12) → Console tab
   - Look for detailed error messages
   - Check Network tab for failed API requests

## Need More Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- [Google Cloud Console](https://console.cloud.google.com/)

