# Firestore Indexes Setup Guide

## Quick Fix: Create Indexes via Console Links

The easiest way to create the required indexes is to click the links in your browser console errors. Each link will open Firebase Console with the index pre-configured.

### Index 1: chatRooms (members + updatedAt)
**Error Link:** Copy the full URL from the console error that mentions `chatRooms` and `members`

**Or create manually:**
- Collection: `chatRooms`
- Fields:
  - `members` (Array contains)
  - `updatedAt` (Descending)

### Index 2: friendRequests (status + toUid + createdAt)
**Error Link:** Copy the full URL from the console error that mentions `friendRequests`

**Or create manually:**
- Collection: `friendRequests`
- Fields:
  - `status` (Ascending)
  - `toUid` (Ascending)
  - `createdAt` (Descending)

### Index 3: chats (participantIds + updatedAt)
**Error Link:** Copy the full URL from the console error that mentions `chats` and `participantIds`

**Or create manually:**
- Collection: `chats`
- Fields:
  - `participantIds` (Array contains)
  - `updatedAt` (Descending)

## Deploy All Indexes at Once (Recommended)

If you prefer to deploy all indexes at once:

```bash
cd project
npx firebase-tools login
npx firebase-tools deploy --only firestore:indexes
```

## What Happens After Creation

1. **Indexes take 1-5 minutes to build** - You'll see a "Building" status in Firebase Console
2. **Once built, errors will stop** - Your app will work normally
3. **Indexes are permanent** - They'll stay active until you delete them

## Current Index Status

All required indexes are defined in `firestore.indexes.json`:
- ✅ chatRooms: members + updatedAt
- ✅ friendRequests: status + toUid + createdAt  
- ✅ chats: participantIds + updatedAt

They just need to be created in Firebase Console or deployed via CLI.

