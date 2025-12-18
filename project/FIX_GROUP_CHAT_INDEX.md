# Fix Group Chat Index Error

## Problem
You're getting this error:
```
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/...
```

## Solution

### Option 1: Deploy Indexes (Recommended)
The index is already defined in `firestore.indexes.json`. Just deploy it:

```bash
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project
firebase deploy --only firestore:indexes
```

**Wait 2-5 minutes** for the index to build, then try creating a group again.

### Option 2: Create Index via Console
1. Click the link in the error message (it will open Firebase Console)
2. Click "Create Index"
3. Wait for the index to build (2-5 minutes)

### Option 3: Use the Direct Link
The index needed is:
- **Collection**: `group_chats`
- **Fields**: 
  - `participantIds` (Array)
  - `updatedAt` (Descending)

## Also Fixed
- ✅ Removed `undefined` fields from group chat documents (this was causing the "invalid data" error)
- ✅ Better error messages in console
- ✅ Validation before creating group

## Test After Fixing
1. Deploy indexes: `firebase deploy --only firestore:indexes`
2. Wait 2-5 minutes
3. Try creating a group again
4. Check browser console - should see "✅ Group chat created successfully"

