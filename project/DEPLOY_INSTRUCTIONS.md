# Deployment Instructions

## Firestore Indexes Deployment

The group chat feature requires Firestore indexes. Deploy them using one of these methods:

### Option 1: Using Firebase CLI (if installed globally)
```bash
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project
firebase deploy --only firestore:indexes
```

### Option 2: Using npx (if Firebase CLI not installed)
```bash
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project
npx firebase-tools deploy --only firestore:indexes
```

### Option 3: Install Firebase CLI globally
```bash
npm install -g firebase-tools
firebase login
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project
firebase deploy --only firestore:indexes
```

### Option 4: Deploy via Firebase Console
1. Go to: https://console.firebase.google.com/project/mr-gyb-ai-app-108/firestore/indexes
2. Click "Create Index" when you see the error link
3. Or manually create:
   - Collection: `group_messages`
   - Fields: `groupId` (ASC), `timestamp` (ASC)
   - Collection: `group_messages`  
   - Fields: `groupId` (ASC), `timestamp` (DESC) - for last message
   - Collection: `group_chats`
   - Fields: `participantIds` (Array), `updatedAt` (DESC)

## Firestore Rules Deployment

Also deploy the updated security rules:

```bash
firebase deploy --only firestore:rules
```

Or via npx:
```bash
npx firebase-tools deploy --only firestore:rules
```

## What Gets Deployed

### Indexes (firestore.indexes.json):
- ✅ `group_chats` - participantIds (Array) + updatedAt (DESC)
- ✅ `group_messages` - groupId (ASC) + timestamp (ASC)
- ✅ `group_messages` - groupId (ASC) + timestamp (DESC) - for last message

### Rules (firestore.rules):
- ✅ Users can read any user (for group invites)
- ✅ Group chats - participants can read/write
- ✅ Group messages - participants can read, senders can write

## After Deployment

1. **Wait 2-5 minutes** for indexes to build
2. **Refresh your browser**
3. **Test group chat** - should work without index errors
4. **Check console** - should see "✅ Using AI Endpoint" or "⚠️ AI disabled" (if no ENV set)

## Production Environment Variables

For production, set in your deployment environment:

```bash
VITE_AI_API_URL=https://your-api-domain.com
```

Or in your hosting platform (Netlify, Vercel, etc.):
- Environment Variable: `VITE_AI_API_URL`
- Value: `https://your-api-domain.com`

## Verification

After deployment, check:
- ✅ No "index required" errors in console
- ✅ Group chats load successfully
- ✅ Messages send and receive in real-time
- ✅ AI works (if VITE_AI_API_URL is set) or gracefully skips (if not)

