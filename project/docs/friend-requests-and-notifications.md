# Friend Requests & Notifications System

## Overview

This document describes the friend request and notification system for the GYB Team Chat application, including data models, flows, archive/delete behavior, and real-time subscription implementation.

## Data Model

### Friend Requests Collection (`friendRequests`)

Normalized collection storing all friend requests:

```typescript
{
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

**Rules:**
- When a request is created → writes to `friendRequests` only (no chat created)
- When accepted → updates status to 'accepted', then creates/ensures chat room
- When declined → sets status to 'declined', removes any provisional chat

### Chat Rooms Collection (`chatRooms`)

Stores 1:1 and group chat rooms:

```typescript
{
  id: string;
  members: string[]; // UIDs of participants
  createdAt: Timestamp;
  lastMessageAt: Timestamp | null;
  pairKey?: string; // Deterministic key for 1:1 chats: [min(uidA, uidB), max(uidA, uidB)].join('_')
  archivedBy?: { [uid: string]: boolean }; // Soft delete - archived by specific users
  canHardDelete?: string[]; // User IDs allowed to permanently delete
}
```

### Messages Subcollection (`chatRooms/{roomId}/messages`)

Stores individual messages:

```typescript
{
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
}
```

## Flows

### 1. Send Friend Request

**Flow:**
1. User A clicks "Send Request" on User B's profile
2. Check if pending request already exists
3. Create new document in `friendRequests` collection:
   ```javascript
   {
     senderId: 'userA',
     receiverId: 'userB',
     status: 'pending',
     createdAt: serverTimestamp()
   }
   ```
4. Real-time listener on User B's pending requests updates badge count
5. **No chat room is created at this stage**

**Console Logs:**
```
📤 Sending friend request from userA to userB
FR lifecycle -> created { id: 'xxx', senderId: 'userA', receiverId: 'userB', status: 'pending' }
Friend request added: { id, senderId, receiverId, status: 'pending' }
```

### 2. Accept Friend Request

**Flow:**
1. User B clicks "Accept" on incoming request
2. Update `friendRequests/{id}` status to 'accepted'
3. Call `createOrGetDirectChat(senderId, receiverId)`:
   - Check for existing chat with `pairKey`
   - If exists, return existing room ID
   - If not, create new `chatRooms` document with both users as members
4. Real-time listener updates:
   - Request removed from pending list
   - Chat appears in "Team Chats" for both users
   - Badge count decrements

**Console Logs:**
```
✅ Accepting friend request: {requestId}
FR lifecycle -> accepted {requestId}
✅ Friend request accepted: {requestId}
✅ Chat room created/retrieved: {chatRoomId}
```

### 3. Decline Friend Request

**Flow:**
1. User B clicks "Decline" on incoming request
2. Update `friendRequests/{id}` status to 'declined'
3. Check for any provisional chat rooms with matching `pairKey`
4. If found, delete the chat room (shouldn't exist, but cleanup)
5. Real-time listener updates:
   - Request removed from pending list
   - Badge count decrements
   - **No chat room remains**

**Console Logs:**
```
❌ Declining friend request: {requestId}
FR lifecycle -> declined {requestId}
✅ Friend request declined: {requestId}
🗑️ Removing provisional chat room after decline (if exists)
✅ Removed chat room: {chatId} (if found)
```

## Archive & Delete Behavior

### Archive Chat (Soft Delete)

**Flow:**
1. User clicks "Archive Chat" (⋯ menu → Archive)
2. Sets `chatRooms/{id}.archivedBy.{userId} = true`
3. Chat disappears from main list for that user only
4. Chat appears in "Archived Chats" section
5. Other user still sees the chat normally

**Restore:**
- User can click "Unarchive" in Archived Chats view
- Removes `archivedBy.{userId}` flag

### Delete Chat (Hard Delete)

**Flow:**
1. User clicks "Delete Chat" (⋯ menu → Delete)
2. If user is in `canHardDelete` array:
   - Delete all messages from `chatRooms/{id}/messages`
   - Delete `chatRooms/{id}` document
   - Chat removed for **all users permanently**
3. If user is NOT in `canHardDelete` array:
   - Soft delete: Archive for this user only
   - Chat remains for other users

**Implementation:**
```typescript
// Check permissions
const canHardDelete = chat.canHardDelete?.includes(user.uid);

if (canHardDelete) {
  // Hard delete - remove from Firestore completely
  await deleteChatForEveryone(chatId, userId);
} else {
  // Soft delete - archive for this user
  await archiveChat(chatId, userId);
}
```

## Real-Time Subscription

### Firestore Listeners

All real-time updates use Firestore `onSnapshot`:

#### 1. Pending Friend Requests

```typescript
const q = query(
  collection(db, 'friendRequests'),
  where('receiverId', '==', currentUserId),
  where('status', '==', 'pending')
);

onSnapshot(q, (snapshot) => {
  const requests = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  console.log('Pending requests snapshot:', requests);
  console.log('Pending requests state:', requests);
  console.log('Badge count rendering:', requests.length);
  console.log('Chat threads (visible):', requests.map(r => r.id));
  
  setPendingRequests(requests); // Triggers re-render with badge count
});
```

#### 2. Sent Friend Requests

```typescript
const q = query(
  collection(db, 'friendRequests'),
  where('senderId', '==', currentUserId),
  where('status', '==', 'pending')
);

onSnapshot(q, (snapshot) => {
  const requests = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  setSentRequests(requests);
});
```

#### 3. User Chat Rooms

```typescript
const q = query(
  collection(db, 'chatRooms'),
  where('members', 'array-contains', userId),
  orderBy('lastMessageAt', 'desc')
);

onSnapshot(q, (snapshot) => {
  const rooms = snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    .filter(room => 
      // Only show rooms where user is a member AND not archived by this user
      room.members.includes(userId) && !room.archivedBy[userId]
    );
  
  console.log(`📋 Found ${rooms.length} active chat rooms for user ${userId}`);
  console.log('Chat threads (visible):', rooms.map(t => t.id));
  
  setChatRooms(rooms);
});
```

### Hook Implementation

`useFriendRequests` hook manages subscriptions:

```typescript
export function useFriendRequests(currentUserId: string | null) {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  
  useEffect(() => {
    if (!currentUserId) return;
    
    const unsubscribeIncoming = watchPendingIncomingRequests(
      currentUserId, 
      (requests) => {
        // Fetch user names and update state
        setPendingRequests(requests);
      }
    );
    
    const unsubscribeSent = watchPendingSentRequests(
      currentUserId,
      (requests) => {
        setSentRequests(requests);
      }
    );
    
    return () => {
      unsubscribeIncoming();
      unsubscribeSent();
    };
  }, [currentUserId]);
  
  return { pendingRequests, sentRequests };
}
```

## Badge Counter

The badge counter displays the number of unseen pending friend requests:

```typescript
// Badge component
<Badge count={pendingRequests.length} />

// Badge shows:
// - Red dot with count if count > 0
// - Hidden if count === 0 (or shows 0 based on design)
// - "99+" if count > 99
```

**Rendering locations:**
1. Friend Requests tab header: `"Incoming (<Badge />)"`
2. Bell icon in app header (top-right)

## Component Structure

### Files Created/Updated

1. **Services:**
   - `src/services/friendRequests.ts` - Normalized friend request operations
   - `src/services/chats.ts` - Chat operations (archive/delete)

2. **Hooks:**
   - `src/hooks/useFriendRequests.ts` - Real-time friend request subscriptions

3. **Components:**
   - `src/components/common/Badge.tsx` - Reusable badge component
   - `src/components/community/FriendRequestsPanel.tsx` - Updated to use new hook
   - `src/components/AppHeaderBell.tsx` - Updated to use new hook
   - `src/components/chat/ChatListItem.tsx` - Chat item with archive/delete menu

## Testing Scenarios

### Scenario A: Send → Accept
1. User A sends request to User B
2. ✅ B sees "Incoming (1)" badge
3. ✅ A sees request in "Sent" tab
4. ✅ No chat appears yet
5. B accepts request
6. ✅ Both users see each other in "Team Chats"
7. ✅ Badge decrements to 0
8. ✅ Chat room created and accessible

### Scenario B: Send → Decline
1. User A sends request to User B
2. ✅ B sees badge count
3. B declines request
4. ✅ Request disappears from both users
5. ✅ No chat room exists

### Scenario C: Archive & Delete
1. Create 2-3 chats between users
2. Archive one chat:
   - ✅ Disappears from main list
   - ✅ Appears in "Archived" section
   - ✅ Other user still sees it
3. Delete one chat (if user has permission):
   - ✅ Disappears for requesting user
   - ✅ If both users delete → thread and messages removed permanently

## Console Logging

Targeted logs for debugging lifecycle:

```javascript
// Friend request created
console.log('FR lifecycle -> created', payload);

// Friend request accepted  
console.log('FR lifecycle -> accepted', id);

// Friend request declined
console.log('FR lifecycle -> declined', id);

// Chat threads visible
console.log('Chat threads (visible):', threads.map(t => t.id));
```

## Firestore Indexes Required

Create composite indexes for queries:

1. **Pending incoming requests:**
   - Collection: `friendRequests`
   - Fields: `receiverId` (Ascending), `status` (Ascending)

2. **Pending sent requests:**
 группе - Collection: `friendRequests`
   - Fields: `senderId` (Ascending), `status` (Ascending)

3. **User chat rooms vanity:**
   - Collection: `chatRooms`
   - Fields: `members` (Array), `lastMessageAt` (Descending)

## Security Rules

Example Firestore security rules:

```javascript
match /friendRequests/{requestId} {
  allow read: if request.auth.uid == resource.data.receiverId 
              || request.auth.uid == resource.data.senderId;
  allow create: if request.auth.uid == request.resource.data.senderId;
  allow update: if request.auth.uid == resource.data.receiverId 
                && request.resource.data.status == 'accepted';
}

match /chatRooms/{roomId} {
  allow read: if request.auth.uid in resource.data.members;
  allow create: if request.auth.uid in request.resource.data.members;
  allow update: if request.auth.uid in resource.data.members;
  allow delete: if request.auth.uid in resource.data.canHardDelete;
}
```
