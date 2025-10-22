import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  or,
  orderBy,
  serverTimestamp,
  getDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Notification, ChatRoom } from '../types/friendships';
import { ensureDirectRoom } from './chat';

// Collection references
const usersCollection = collection(db, 'users');
const chatRoomsCollection = collection(db, 'chatRooms');

/**
 * Send friend request: add to recipient.pendingRequests and sender.sentRequests; add notification to recipient.
 */
const sendFriendRequest = async (fromUid: string, toUid: string): Promise<void> => {
  try {
    // Guard against self-requests
    if (fromUid === toUid) {
      throw new Error('Cannot send friend request to yourself');
    }

    // Check if request already exists
    const existingRequest = await getFriendRequest(toUid, fromUid);
    if (existingRequest) {
      throw new Error('Friend request already exists');
    }

    const batch = writeBatch(db);
    
    // Get both user documents
    const [fromUserRef, toUserRef] = [
      doc(usersCollection, fromUid),
      doc(usersCollection, toUid)
    ];
    
    const [fromUserDoc, toUserDoc] = await Promise.all([
      getDoc(fromUserRef),
      getDoc(toUserRef)
    ]);

    if (!fromUserDoc.exists() || !toUserDoc.exists()) {
      throw new Error('One or both users not found');
    }

    const fromUserData = fromUserDoc.data();
    const toUserData = toUserDoc.data();

    // Add to sender's sentRequests
    batch.update(fromUserRef, {
      sentRequests: [...(fromUserData.sentRequests || []), toUid],
      updatedAt: serverTimestamp()
    });

    // Add to recipient's pendingRequests
    batch.update(toUserRef, {
      pendingRequests: [...(toUserData.pendingRequests || []), fromUid],
      updatedAt: serverTimestamp()
    });

    // Add notification to recipient
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'friend_request',
      fromUser: fromUid,
      timestamp: serverTimestamp() as Timestamp,
      read: false
    };

    batch.update(toUserRef, {
      notifications: [...(toUserData.notifications || []), notification]
    });

    await batch.commit();
    console.log('✅ Friend request sent successfully');
  } catch (error: any) {
    console.error('❌ Error sending friend request:', error);
    throw error;
  }
};

/**
 * Watch incoming requests for a user (recipient)
 */
const watchIncomingRequests = (
  uid: string, 
  cb: (uids: string[]) => void
): (() => void) => {
  try {
    const userRef = doc(usersCollection, uid);
    
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const pendingRequests = data.pendingRequests || [];
        console.log(`📨 Incoming requests updated: ${pendingRequests.length} requests`);
        cb(pendingRequests);
      } else {
        cb([]);
      }
    }, (error) => {
      console.error('❌ Error watching incoming requests:', error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up incoming requests listener:', error);
    throw error;
  }
};

/**
 * Watch outgoing requests for a user (sender)
 */
const watchOutgoingRequests = (
  uid: string, 
  cb: (uids: string[]) => void
): (() => void) => {
  try {
    const userRef = doc(usersCollection, uid);
    
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const sentRequests = data.sentRequests || [];
        console.log(`📤 Outgoing requests updated: ${sentRequests.length} requests`);
        cb(sentRequests);
      } else {
        cb([]);
      }
    }, (error) => {
      console.error('❌ Error watching outgoing requests:', error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up outgoing requests listener:', error);
    throw error;
  }
};

/**
 * Accept request: move from pending/sent into both users' friends[]; create chatRoom if not exists; add notification to sender.
 */
const acceptFriendRequest = async (recipientUid: string, senderUid: string): Promise<string> => {
  try {
    const batch = writeBatch(db);
    
    // Get both user documents
    const [recipientUserRef, senderUserRef] = [
      doc(usersCollection, recipientUid),
      doc(usersCollection, senderUid)
    ];
    
    const [recipientUserDoc, senderUserDoc] = await Promise.all([
      getDoc(recipientUserRef),
      getDoc(senderUserRef)
    ]);

    if (!recipientUserDoc.exists() || !senderUserDoc.exists()) {
      throw new Error('One or both users not found');
    }

    const recipientUserData = recipientUserDoc.data();
    const senderUserData = senderUserDoc.data();

    // Remove from pending/sent arrays and add to friends
    batch.update(recipientUserRef, {
      friends: [...(recipientUserData.friends || []), senderUid],
      pendingRequests: (recipientUserData.pendingRequests || []).filter((uid: string) => uid !== senderUid),
      updatedAt: serverTimestamp()
    });

    batch.update(senderUserRef, {
      friends: [...(senderUserData.friends || []), recipientUid],
      sentRequests: (senderUserData.sentRequests || []).filter((uid: string) => uid !== recipientUid),
      updatedAt: serverTimestamp()
    });

    // Add notification to sender
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'request_accepted',
      fromUser: recipientUid,
      timestamp: serverTimestamp() as Timestamp,
      read: false
    };

    batch.update(senderUserRef, {
      notifications: [...(senderUserData.notifications || []), notification]
    });

    await batch.commit();

    // Create chatRoom if it doesn't exist
    const roomId = await ensureDirectRoom(recipientUid, senderUid);

    console.log('✅ Friend request accepted and chat room created:', roomId);
    return roomId;
  } catch (error: any) {
    console.error('❌ Error accepting friend request:', error);
    throw error;
  }
};

/**
 * Decline: remove from recipient.pendingRequests and sender.sentRequests
 */
const declineFriendRequest = async (recipientUid: string, senderUid: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Get both user documents
    const [recipientUserRef, senderUserRef] = [
      doc(usersCollection, recipientUid),
      doc(usersCollection, senderUid)
    ];
    
    const [recipientUserDoc, senderUserDoc] = await Promise.all([
      getDoc(recipientUserRef),
      getDoc(senderUserRef)
    ]);

    if (!recipientUserDoc.exists() || !senderUserDoc.exists()) {
      throw new Error('One or both users not found');
    }

    const recipientUserData = recipientUserDoc.data();
    const senderUserData = senderUserDoc.data();

    // Remove from pending/sent arrays
    batch.update(recipientUserRef, {
      pendingRequests: (recipientUserData.pendingRequests || []).filter((uid: string) => uid !== senderUid),
      updatedAt: serverTimestamp()
    });

    batch.update(senderUserRef, {
      sentRequests: (senderUserData.sentRequests || []).filter((uid: string) => uid !== recipientUid),
      updatedAt: serverTimestamp()
    });

    await batch.commit();
    console.log('✅ Friend request declined');
  } catch (error: any) {
    console.error('❌ Error declining friend request:', error);
    throw error;
  }
};

/**
 * Remove connection: remove each other's uid from friends[]
 */
const removeConnection = async (uidA: string, uidB: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Get both user documents
    const [userARef, userBRef] = [
      doc(usersCollection, uidA),
      doc(usersCollection, uidB)
    ];
    
    const [userADoc, userBDoc] = await Promise.all([
      getDoc(userARef),
      getDoc(userBRef)
    ]);

    if (!userADoc.exists() || !userBDoc.exists()) {
      throw new Error('One or both users not found');
    }

    const userAData = userADoc.data();
    const userBData = userBDoc.data();

    // Remove from friends arrays
    batch.update(userARef, {
      friends: (userAData.friends || []).filter((uid: string) => uid !== uidB),
      updatedAt: serverTimestamp()
    });

    batch.update(userBRef, {
      friends: (userBData.friends || []).filter((uid: string) => uid !== uidA),
      updatedAt: serverTimestamp()
    });

    await batch.commit();
    console.log('✅ Connection removed');
  } catch (error: any) {
    console.error('❌ Error removing connection:', error);
    throw error;
  }
};

/**
 * Watch current connections
 */
const watchConnections = (
  uid: string, 
  cb: (friendUids: string[]) => void
): (() => void) => {
  try {
    const userRef = doc(usersCollection, uid);
    
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const friends = data.friends || [];
        console.log(`👥 Connections updated: ${friends.length} friends`);
        cb(friends);
      } else {
        cb([]);
      }
    }, (error) => {
      console.error('❌ Error watching connections:', error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up connections listener:', error);
    throw error;
  }
};

/**
 * Helpers for UI to fetch single request/connection
 */
const getFriendRequest = async (recipientUid: string, senderUid: string): Promise<boolean> => {
  try {
    const userRef = doc(usersCollection, recipientUid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const data = userDoc.data();
    const pendingRequests = data.pendingRequests || [];
    return pendingRequests.includes(senderUid);
  } catch (error) {
    console.error('❌ Error getting friend request:', error);
    return false;
  }
};

const getConnection = async (uidA: string, uidB: string): Promise<boolean> => {
  try {
    const userRef = doc(usersCollection, uidA);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const data = userDoc.data();
    const friends = data.friends || [];
    return friends.includes(uidB);
  } catch (error) {
    console.error('❌ Error getting connection:', error);
    return false;
  }
};


// Export all functions
export {
  sendFriendRequest,
  watchIncomingRequests,
  watchOutgoingRequests,
  acceptFriendRequest,
  declineFriendRequest,
  removeConnection,
  watchConnections,
  getFriendRequest,
  getConnection
};