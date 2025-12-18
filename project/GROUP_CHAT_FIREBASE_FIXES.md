# Group Chat Firebase Fixes

## Issues Fixed

### 1. **Firestore Rules - User Search**
- **Problem**: Users couldn't be searched for group invites because rules only allowed reading own profile
- **Fix**: Updated rules to allow authenticated users to read any user (for search/invite purposes)
- **File**: `firestore.rules` - Merged duplicate `match /users/{userId}` blocks

### 2. **User Profile Fetching**
- **Problem**: Group participants showed placeholder names like "User abc123"
- **Fix**: Added user profile fetching when creating groups to get real names and avatars
- **Files**: 
  - `src/services/groupChat.service.ts` - Fetches user profiles for creator and invited users
  - `src/services/groupChat.service.ts` - Fetches profiles when sending messages and getting participants

### 3. **User Search Error Handling**
- **Problem**: User search would fail silently if Firestore index wasn't created
- **Fix**: Added fallback to name search if email index isn't available, better error messages
- **File**: `src/components/groupChat/CreateGroupModal.tsx`

### 4. **Group Creation Flow**
- **Problem**: Group creation errors weren't clearly displayed
- **Fix**: Improved error handling and user feedback
- **Files**:
  - `src/hooks/useGroupChat.ts` - Better error messages
  - `src/components/groupChat/CreateGroupModal.tsx` - Clearer error alerts
  - `src/components/groupChat/GroupChatView.tsx` - Better error display UI

### 5. **Participant IDs Array**
- **Problem**: Firestore queries for group participants were inefficient
- **Fix**: Added `participantIds` array alongside `participants` array for faster queries
- **File**: `src/services/groupChat.service.ts`

## Testing Steps

### 1. Deploy Firestore Rules
```bash
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project
firebase deploy --only firestore:rules
```

### 2. Test User Search
1. Go to `/group-chat` or click "Culture" tab
2. Click "+" to create a group
3. Type in the search box (at least 2 characters)
4. **Expected**: Users should appear in the dropdown
5. **If no users appear**: 
   - Check browser console for errors
   - Verify you have users in Firestore `users` collection
   - Check Firestore rules are deployed

### 3. Test Group Creation
1. Enter a group name
2. Search and select at least one user (or select an AI agent)
3. Click "Create Group"
4. **Expected**: 
   - Group appears in left panel
   - Group is automatically selected
   - You can see participants with real names (not placeholders)
5. **If it fails**:
   - Check browser console for errors
   - Verify backend is running (`http://localhost:8080`)
   - Check Firestore rules are deployed

### 4. Test Real-Time Updates
1. Create a group with another user
2. Open the group in two different browser windows (or incognito)
3. Send a message in one window
4. **Expected**: Message appears immediately in the other window

## Common Issues & Solutions

### Issue: "Permission denied" when searching users
**Solution**: 
```bash
firebase deploy --only firestore:rules
```

### Issue: Users show as "User abc123" instead of real names
**Solution**: 
- Check that user documents in Firestore have `name` or `displayName` fields
- Check browser console for profile fetch errors

### Issue: Group creation fails silently
**Solution**:
- Check browser console for detailed error messages
- Verify backend is running
- Check Firestore rules are deployed
- Verify you're logged in

### Issue: "The query requires an index" error
**Solution**:
1. Click the link in the error message to create the index
2. Or manually create index in Firebase Console:
   - Collection: `users`
   - Fields: `email` (Ascending)
   - Query scope: Collection

## Files Changed

1. `firestore.rules` - Fixed user read permissions
2. `src/services/groupChat.service.ts` - Added user profile fetching
3. `src/components/groupChat/CreateGroupModal.tsx` - Improved user search
4. `src/hooks/useGroupChat.ts` - Better error handling
5. `src/components/groupChat/GroupChatView.tsx` - Better error display

## Next Steps

1. ✅ Deploy Firestore rules
2. ✅ Test user search
3. ✅ Test group creation
4. ✅ Test real-time messaging
5. ✅ Verify user names display correctly

If everything works, you should be able to:
- Search for users by email
- Create groups with real user names
- See messages in real-time
- Have AI agents respond in groups

