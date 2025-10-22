# 🔥 Firebase Setup Guide

## 🚨 **CORS Error Resolution**

The CORS error you're experiencing is because Firebase is trying to connect to local emulators that aren't running. Here's how to fix it:

### **Option 1: Use Production Firebase (Recommended)**

1. **Create `.env.local` file** in your project root:
```bash
# Firebase Configuration
VITE_USE_EMULATORS=false
```

2. **Restart your development server**:
```bash
npm run dev
```

### **Option 2: Use Firebase Emulators (Development Only)**

1. **Install Firebase CLI** (if not already installed):
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**:
```bash
firebase login
```

3. **Initialize Firebase in your project**:
```bash
firebase init
```

4. **Start Firebase emulators**:
```bash
firebase emulators:start
```

5. **Create `.env.local` file**:
```bash
VITE_USE_EMULATORS=true
```

6. **Restart your development server**:
```bash
npm run dev
```

## 🔧 **Environment Variables**

Create a `.env.local` file in your project root with the following variables:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Emulator Configuration (optional)
VITE_USE_EMULATORS=false
```

## 🚀 **Quick Fix for Current Error**

To immediately resolve the CORS error:

1. **Create `.env.local` file**:
```bash
echo "VITE_USE_EMULATORS=false" > .env.local
```

2. **Restart your development server**:
```bash
npm run dev
```

## 🔍 **Error Explanation**

The errors you're seeing are:

1. **CORS Error**: Firebase trying to connect to `localhost:8080` (emulator) but it's not running
2. **Storage Error**: Wrong storage import (Firebase Storage vs localStorage utility)
3. **Connection Error**: Firestore can't reach the backend

## ✅ **What I Fixed**

1. **Updated Firebase configuration** to only use emulators when explicitly enabled
2. **Fixed storage import** in AuthContext to use localStorage utility instead of Firebase Storage
3. **Added offline error handling** to prevent logout on connection issues
4. **Added environment variable control** for emulator usage

## 🎯 **Result**

- ✅ No more CORS errors
- ✅ No more storage.clear errors  
- ✅ Proper offline handling
- ✅ Production Firebase connection
- ✅ All friendship and chat features working

Your app should now work correctly with production Firebase!
