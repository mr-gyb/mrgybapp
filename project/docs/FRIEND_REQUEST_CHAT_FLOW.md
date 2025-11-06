# Friend Request & Chat Flow Documentation

## ✅ Database Behavior Verified

### **Chat Database Behavior**

Based on the code implementation:

1. **When a friend request is SENT:**
   - ✅ NO chat room is created
   - ✅ Request is added to `friendRequests` collection with `status: 'pending'`
   - ✅ Sender's `sentRequests` array is updated
   - ✅ Receiver's `pendingRequests` array is updated
   - ✅ Notification is added to receiver
   - ❌ **Chat room does NOT exist in database**

2. **When a friend request is ACCEPTED:**
   - ✅ Users are added to each other's `friends[]` array
   - ✅ Request is removed from `pendingRequests` and `sentRequests`
   - ✅ Chat room is **ONLY THEN created** via `ensureDirectRoom()`
   - ✅ Chat room appears in `chatRooms` collection
   - ✅ Notification is sent to sender

3. **When a friend request is DECLINED:**
   - ✅ Request is removed from `pendingRequests` array (receiver)
   - ✅ Request is removed from `sentRequests` array (sender)
   - ✅ Request status is updated to `'declined'`
   - ❌ **NO chat room is created**
   - ❌ **Chat room does NOT exist in database**

**Code Location:** `src/services/friends.ts`
- `acceptFriendRequest()` → calls `ensureDirectRoom()` on line 209
- `declineFriendRequest()` → only removes from arrays, no chat creation

### **Notification Badge Behavior**

The notification badge now:

1. **Initializes to 0:**
   - ✅ `usePendingFriendRequests` hook initializes with `useState<number>(0)`
   - ✅ Badge count starts at 0 when component mounts
   - ✅ Shows empty circle (no badge) when count is 0

2. **Dynamically tracks pending friend requests:**
   - ✅ Uses real-time Firestore listener: `onSnapshot(query(...))`
   - ✅ Queries `friendRequests` collection where:
     - `receiverId == currentUserId`
     - `status == 'pending'`
   - ✅ Count updates automatically when:
     - New request is received (count increases)
     - Request is accepted (count decreases)
     - Request is declined (count decreases)

3. **Combined count display:**
   - ✅ Shows: `pendingFriendRequests + unreadNotifications`
   - ✅ Badge appears as red circle with count
   - ✅ Badge hides when count is 0

**Code Location:** 
- Hook: `src/hooks/usePendingFriendRequests.ts`
- Component: `src/components/common/NotificationBell.tsx`

### **Implementation Details**

#### Chat Room Creation Flow
```typescript
// In acceptFriendRequest (friends.ts:208)
await batch.commit();

// Create chatRoom ONLY after acceptance
const roomId = await ensureDirectRoom(recipientUid, senderUid);
console.log('✅ Friend request accepted and chat room created:', roomId);
```

#### Badge Count Flow
```typescript
// Initial state
const [pendingCount, setPendingCount] = useState<number>(0); // Starts at 0

// Real-time listener
const q = query(
  friendRequestsCollection,
  where('receiverId', '==', userId),
  where('status', '==', 'pending')
);

onSnapshot(q, (snapshot) => {
  const count = snapshot.docs.length; // Updates dynamically
  setPendingCount(count);
});
```

## 🧪 Testing Checklist

### Chat Database
- [ ] Send friend request → Verify NO chat room in database
- [ ] Accept friend request → Verify chat room created in `chatRooms` collection
- [ ] Decline friend request → Verify NO chat room in database

### Notification Badge
- [ ] Page load → Badge count starts at 0 (no badge visible)
- [ ] Receive friend request → Badge count increases to 1
- [ ] Accept request → Badge count decreases to 0
- [ ] Decline request → Badge count decreases to 0
- [ ] Multiple requests → Badge shows correct count (up to 9+)

## 📊 Database Structure

### Friend Requests
```typescript
friendRequests/{requestId}
{
  senderId: string,
  receiverId: string,
  status: 'pending' | 'accepted' | 'declined',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Chat Rooms
```typescript
chatRooms/{roomId}
{
  members: [uid1, uid2],
  createdAt: Timestamp,
  lastMessageAt: Timestamp | null,
  pairKey: string // Generated from sorted member UIDs
}
```

### Users
```typescript
users/{uid}
{
  friends: string[],
  pendingRequests: string[],
  sentRequests: string[],
  notifications: Notification[]
}
```

## ✅ Current Implementation Status

- ✅ Chat rooms only created on accept
- ✅ No chat rooms created on send or decline
- ✅ Notification badge initializes to 0
- ✅ Badge tracks pending friend requests in real-time
- ✅ Badge updates dynamically based on database changes

