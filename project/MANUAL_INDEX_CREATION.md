# Manual Firestore Index Creation Guide

## 🔐 403 Error? Here's How to Fix It

If you're getting 403 errors, you need to:
1. **Log into Firebase Console** with the correct account
2. **Have proper permissions** (Editor or Owner role)

## 📋 Manual Index Creation Steps

### Step 1: Open Firebase Console
Go directly to: https://console.firebase.google.com/project/mr-gyb-ai-app-108/firestore/indexes

**If you get 403:**
- Make sure you're logged into the Google account that owns/has access to the project
- Try a different browser or incognito mode
- Contact the project owner to grant you access

### Step 2: Create Each Index

#### Index 1: chatRooms
1. Click **"Create Index"**
2. **Collection ID:** `chatRooms`
3. **Add Fields:**
   - Field: `members` → Query scope: **Collection** → Type: **Array**
   - Field: `updatedAt` → Query scope: **Collection** → Type: **Descending**
4. Click **"Create"**

#### Index 2: friendRequests
1. Click **"Create Index"**
2. **Collection ID:** `friendRequests`
3. **Add Fields:**
   - Field: `status` → Query scope: **Collection** → Type: **Ascending**
   - Field: `toUid` → Query scope: **Collection** → Type: **Ascending**
   - Field: `createdAt` → Query scope: **Collection** → Type: **Descending**
4. Click **"Create"**

#### Index 3: chats
1. Click **"Create Index"**
2. **Collection ID:** `chats`
3. **Add Fields:**
   - Field: `participantIds` → Query scope: **Collection** → Type: **Array**
   - Field: `updatedAt` → Query scope: **Collection** → Type: **Descending**
4. Click **"Create"**

## 🚀 Alternative: Deploy via CLI

If you have Firebase CLI access:

```bash
cd project
npx firebase-tools login
npx firebase-tools deploy --only firestore:indexes
```

## ⏱️ After Creating

- Each index takes **1-5 minutes** to build
- Status will show: "Building" → "Enabled"
- Once all are enabled, errors will stop
- Your app will work normally
