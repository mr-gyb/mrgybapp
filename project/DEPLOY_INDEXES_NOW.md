# ⚠️ DEPLOY FIRESTORE INDEXES NOW

## Critical: Indexes Required

You're getting errors because Firestore indexes haven't been deployed yet. **You must deploy them before group chats will work.**

## Quick Fix

Run this command:

```bash
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project
firebase deploy --only firestore:indexes
```

**Wait 2-5 minutes** for indexes to build, then refresh your browser and try again.

## What Indexes Are Needed

1. **group_chats** collection:
   - Fields: `participantIds` (Array) + `updatedAt` (Descending)

2. **group_messages** collection:
   - Fields: `groupId` (Ascending) + `timestamp` (Ascending)

Both are already defined in `firestore.indexes.json` - just need to deploy!

## After Deploying

1. ✅ Wait 2-5 minutes for indexes to build
2. ✅ Refresh your browser
3. ✅ Try creating a group again
4. ✅ Try sending a message

## Also Fixed

- ✅ Removed `undefined` avatar fields from group messages
- ✅ Fixed `serverTimestamp()` in arrays issue
- ✅ Better error handling

## Check Index Status

Go to: https://console.firebase.google.com/project/mr-gyb-ai-app-108/firestore/indexes

You should see both indexes building/completed.

