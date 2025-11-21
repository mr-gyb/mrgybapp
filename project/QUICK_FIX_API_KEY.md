# 🚨 Quick Fix: Firebase API Key Expired

## ❌ **Current Error:**
```
Firebase: Error (auth/api-key-expired.-please-renew-the-api-key.)
```

## ✅ **Quick Fix (2 minutes):**

### **Step 1: Get New API Key**
1. Open: https://console.firebase.google.com/project/mr-gyb-ai-app-108/settings/general
2. Scroll to **"Your apps"** section
3. Click on your **Web app** (or create one if needed)
4. Copy the **API Key** (starts with `AIzaSy...`)

### **Step 2: Update .env File**
```bash
cd project
nano .env  # or use your preferred editor
```

Find this line:
```env
VITE_FIREBASE_API_KEY=AIzaSyDPvjv_Aa-7h7-TZkpJ94n3oigt0t8Z2xI
```

Replace with your new key:
```env
VITE_FIREBASE_API_KEY=AIzaSy...your_new_key_here
```

Save the file (Ctrl+X, then Y, then Enter in nano)

### **Step 3: Restart Dev Server**
```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### **Step 4: Try Login Again**
The error should be gone! ✅

## 🔍 **Verify It Worked:**
After restarting, check the browser console - you should NOT see the expired API key error anymore.

## ⚠️ **Important:**
- **You MUST restart the dev server** after updating .env - Vite only loads env vars on startup
- The .env file is in the `project/` directory, not the root
- Never commit .env to git (it should be in .gitignore)

## 🆘 **Still Not Working?**
1. Make sure you saved the .env file
2. Make sure you restarted the dev server
3. Check browser console for other errors
4. Verify the API key in Firebase Console is active

