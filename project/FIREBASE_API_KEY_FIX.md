# 🔥 Firebase API Key Expired - Fix Guide

## ❌ **Error:**
```
Firebase: Error (auth/api-key-expired.-please-renew-the-api-key.)
```

## ✅ **Solution:**

Your Firebase API key has expired. You need to get a new one from Firebase Console and update your `.env` file.

### **Step 1: Get New Firebase API Key**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **mr-gyb-ai-app-108**
3. Click the **gear icon** ⚙️ next to "Project Overview"
4. Select **Project Settings**
5. Scroll down to **"Your apps"** section
6. Find your **Web app** (or create one if it doesn't exist)
7. Copy the **API Key** (it starts with `AIzaSy...`)

### **Step 2: Update Your .env File**

1. **Check if you have a `.env` file** in the `project/` directory:
   ```bash
   cd project
   ls -la .env
   ```

2. **If the file exists**, edit it and update the API key:
   ```bash
   # Open in your editor
   code .env
   # or
   nano .env
   ```

3. **If the file doesn't exist**, create it:
   ```bash
   cp env-template.txt .env
   ```

4. **Update the Firebase API key** in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...your_new_key_here
   ```

### **Step 3: Restart Your Development Server**

After updating the `.env` file:

1. **Stop your current dev server** (Ctrl+C)
2. **Restart it**:
   ```bash
   npm run dev
   ```

### **Step 4: Verify It Works**

1. Try logging in again
2. The error should be gone
3. You should be able to sign in successfully

## 🔍 **Quick Check:**

To verify your API key is set correctly:

```bash
cd project
grep VITE_FIREBASE_API_KEY .env
```

You should see:
```
VITE_FIREBASE_API_KEY=AIzaSy...your_key
```

## ⚠️ **Important Notes:**

- **Never commit `.env` to git** - it contains sensitive keys
- **The API key is public** - it's safe to use in frontend code
- **If you're using Firebase emulators**, you don't need a real API key for local development
- **Make sure `.env` is in `.gitignore`**

## 🆘 **If You Still Have Issues:**

1. **Check Firebase Console** - make sure your project is active
2. **Verify all Firebase config values** in `.env` match Firebase Console
3. **Clear browser cache** and try again
4. **Check browser console** for other errors

## 📝 **Full Firebase Config Template:**

Your `.env` file should have all these values:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...your_new_key
VITE_FIREBASE_AUTH_DOMAIN=mr-gyb-ai-app-108.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mr-gyb-ai-app-108
VITE_FIREBASE_STORAGE_BUCKET=mr-gyb-ai-app-108.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Get all these values from Firebase Console → Project Settings → Your apps → Web app config.

