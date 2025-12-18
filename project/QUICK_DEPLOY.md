# Quick Deploy Guide

## Step 1: Login to Firebase

```bash
npx firebase-tools login
```

This will open a browser window for authentication.

## Step 2: Deploy Firestore Indexes

```bash
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project
npx firebase-tools deploy --only firestore:indexes
```

## Step 3: Deploy Firestore Rules

```bash
npx firebase-tools deploy --only firestore:rules
```

## Step 4: Wait for Indexes to Build

- Indexes take 2-5 minutes to build
- Check status: https://console.firebase.google.com/project/mr-gyb-ai-app-108/firestore/indexes
- Status will show "Building" → "Enabled"

## Step 5: Test

1. Refresh your browser
2. Go to group chat
3. Create a group
4. Send messages
5. Check console - should see no index errors

## Alternative: Deploy via Firebase Console

If CLI doesn't work:

1. Go to: https://console.firebase.google.com/project/mr-gyb-ai-app-108/firestore/indexes
2. When you see index errors in console, click the link in the error
3. Click "Create Index" button
4. Wait for index to build

## Required Indexes

1. **group_chats**:
   - `participantIds` (Array)
   - `updatedAt` (DESC)

2. **group_messages** (for message list):
   - `groupId` (ASC)
   - `timestamp` (ASC)

3. **group_messages** (for last message):
   - `groupId` (ASC)
   - `timestamp` (DESC)

All indexes are already defined in `firestore.indexes.json` - just need to deploy!

