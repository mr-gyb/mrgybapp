# 👥 Friends Service Guide

## ✅ **Created: `src/services/friends.ts`**

A comprehensive friends service with typed helper functions using Firebase v9 modular SDK.

## 🎯 **Core Functions Implemented:**

### **✅ Required Functions:**
- **`sendFriendRequest(toUid: string)`** - Send friend request
- **`watchIncomingRequests(uid, cb)`** - Real-time incoming requests
- **`acceptFriendRequest(requestId: string)`** - Accept friend request
- **`watchConnections(uid, cb)`** - Real-time connections

### **✅ Additional Helper Functions:**
- **`declineFriendRequest(requestId: string)`** - Decline friend request
- **`watchOutgoingRequests(uid, cb)`** - Real-time outgoing requests
- **`removeConnection(connectionId: string)`** - Remove friend connection
- **`getFriendRequest(requestId: string)`** - Get specific request
- **`getConnection(connectionId: string)`** - Get specific connection

## 📊 **Type Definitions:**

### **FriendRequest Interface:**
```typescript
interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### **Connection Interface:**
```typescript
interface Connection {
  id: string;
  aUid: string;
  bUid: string;
  createdAt: Timestamp;
}
```

## 🚀 **Usage Examples:**

### **1. Send Friend Request:**
```typescript
import { sendFriendRequest } from '../services/friends';

// Send a friend request
try {
  await sendFriendRequest('user-123');
  console.log('Friend request sent!');
} catch (error) {
  console.error('Failed to send friend request:', error);
}
```

### **2. Watch Incoming Requests:**
```typescript
import { watchIncomingRequests } from '../services/friends';

// Set up real-time listener
const unsubscribe = watchIncomingRequests('current-user-id', (requests) => {
  console.log('Incoming requests:', requests);
  // Update UI with new requests
});

// Clean up listener when component unmounts
// unsubscribe();
```

### **3. Accept Friend Request:**
```typescript
import { acceptFriendRequest } from '../services/friends';

// Accept a friend request
try {
  await acceptFriendRequest('request-123');
  console.log('Friend request accepted!');
} catch (error) {
  console.error('Failed to accept friend request:', error);
}
```

### **4. Watch Connections:**
```typescript
import { watchConnections } from '../services/friends';

// Set up real-time listener for connections
const unsubscribe = watchConnections('current-user-id', (connections) => {
  console.log('Connections:', connections);
  // Update UI with friend list
});
```

## 🔧 **Firebase Collections Structure:**

### **friendRequests Collection:**
```javascript
{
  fromUid: "user-123",
  toUid: "user-456", 
  status: "pending", // "pending" | "accepted" | "declined"
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### **connections Collection:**
```javascript
{
  aUid: "user-123",
  bUid: "user-456",
  createdAt: Timestamp
}
```

## 🎯 **React Component Integration:**

### **Example: Friends List Component:**
```typescript
import React, { useState, useEffect } from 'react';
import { 
  watchConnections, 
  watchIncomingRequests, 
  acceptFriendRequest,
  declineFriendRequest 
} from '../services/friends';

const FriendsList: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    const currentUserId = 'current-user-id'; // Get from auth context
    
    // Watch connections
    const unsubscribeConnections = watchConnections(currentUserId, setConnections);
    
    // Watch incoming requests
    const unsubscribeRequests = watchIncomingRequests(currentUserId, setIncomingRequests);
    
    return () => {
      unsubscribeConnections();
      unsubscribeRequests();
    };
  }, []);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
    } catch (error) {
      console.error('Failed to decline request:', error);
    }
  };

  return (
    <div>
      <h2>Friends ({connections.length})</h2>
      {connections.map(connection => (
        <div key={connection.id}>
          Friend: {connection.aUid === 'current-user-id' ? connection.bUid : connection.aUid}
        </div>
      ))}
      
      <h2>Friend Requests ({incomingRequests.length})</h2>
      {incomingRequests.map(request => (
        <div key={request.id}>
          From: {request.fromUid}
          <button onClick={() => handleAcceptRequest(request.id)}>Accept</button>
          <button onClick={() => handleDeclineRequest(request.id)}>Decline</button>
        </div>
      ))}
    </div>
  );
};
```

## 🔒 **Security Rules (Firestore):**

### **friendRequests Collection:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /friendRequests/{requestId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.fromUid || 
         request.auth.uid == resource.data.toUid);
    }
  }
}
```

### **connections Collection:**
```javascript
match /connections/{connectionId} {
  allow read, write: if request.auth != null && 
    (request.auth.uid == resource.data.aUid || 
     request.auth.uid == resource.data.bUid);
}
```

## 🎉 **Features:**

### **✅ Real-time Updates:**
- **Live friend requests** as they come in
- **Live connections** as they're added/removed
- **Automatic UI updates** without manual refresh

### **✅ Type Safety:**
- **Full TypeScript support** with proper interfaces
- **Compile-time error checking** for all functions
- **IntelliSense support** for better development experience

### **✅ Error Handling:**
- **Comprehensive error logging** for debugging
- **Graceful error handling** with try-catch blocks
- **User-friendly error messages**

### **✅ Performance:**
- **Efficient queries** with proper indexing
- **Real-time listeners** with automatic cleanup
- **Optimized data structures** for fast access

## 🚀 **Next Steps:**

1. **Import the service** in your components
2. **Set up Firebase security rules** for the collections
3. **Create UI components** using the service functions
4. **Test the real-time functionality** with multiple users
5. **Add error handling** and loading states to your UI

The friends service is now ready to use! 🎉👥
