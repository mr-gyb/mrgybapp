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
import { 
  UserProfile, 
  Notification, 
  FriendRequestWithUser, 
  ConnectionWithUser,
  FriendRequestListener,
  ConnectionListener,
  NotificationListener
} from '../types/friendship';

// Collection references
const usersCollection = collection(db, 'users');
const friendRequestsCollection = collection(db, 'friendRequests');
const connectionsCollection = collection(db, 'connections');

/**
 * Get user profile by UID
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(usersCollection, uid);
    const snapshot = await getDoc(userRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    return {
      uid: snapshot.id,
      name: data.name || '',
      businessName: data.businessName || '',
      industry: data.industry || '',
      email: data.email || '',
      friends: data.friends || [],
      pendingRequests: data.pendingRequests || [],
      sentRequests: data.sentRequests || [],
      notifications: data.notifications || [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    return null;
  }
};

/**
 * Create or update user profile
 */
export const createOrUpdateUserProfile = async (
  uid: string, 
  profileData: Partial<UserProfile>
): Promise<UserProfile> => {
  try {
    const userRef = doc(usersCollection, uid);
    const now = serverTimestamp();
    
    const profile: Partial<UserProfile> = {
      ...profileData,
      uid,
      friends: profileData.friends || [],
      pendingRequests: profileData.pendingRequests || [],
      sentRequests: profileData.sentRequests || [],
      notifications: profileData.notifications || [],
      createdAt: profileData.createdAt || now,
      updatedAt: now
    };
    
    await updateDoc(userRef, profile);
    
    console.log('✅ User profile updated successfully');
    return profile as UserProfile;
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    throw error;
  }
};

/**
 * Send friend request with user profile updates
 */
export const sendFriendRequest = async (fromUid: string, toUid: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Check if request already exists
    const existingRequest = await checkExistingRequest(fromUid, toUid);
    if (existingRequest) {
      throw new Error('Friend request already exists');
    }
    
    // Create friend request document
    const requestRef = doc(friendRequestsCollection);
    const requestData = {
      fromUid,
      toUid,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    batch.set(requestRef, requestData);
    
    // Update sender's sentRequests
    const fromUserRef = doc(usersCollection, fromUid);
    const fromUserDoc = await getDoc(fromUserRef);
    if (fromUserDoc.exists()) {
      const fromUserData = fromUserDoc.data();
      batch.update(fromUserRef, {
        sentRequests: [...(fromUserData.sentRequests || []), requestRef.id]
      });
    }
    
    // Update receiver's pendingRequests
    const toUserRef = doc(usersCollection, toUid);
    const toUserDoc = await getDoc(toUserRef);
    if (toUserDoc.exists()) {
      const toUserData = toUserDoc.data();
      batch.update(toUserRef, {
        pendingRequests: [...(toUserData.pendingRequests || []), requestRef.id]
      });
    }
    
    // Add notification to receiver
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'friend_request',
      fromUser: fromUid,
      timestamp: serverTimestamp() as Timestamp,
      read: false
    };
    
    const toUserNotifications = toUserDoc.exists() ? toUserDoc.data().notifications || [] : [];
    batch.update(toUserRef, {
      notifications: [...toUserNotifications, notification]
    });
    
    await batch.commit();
    console.log('✅ Friend request sent successfully');
  } catch (error) {
    console.error('❌ Error sending friend request:', error);
    throw error;
  }
};

/**
 * Accept friend request with user profile updates
 */
export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Get the friend request
    const requestRef = doc(friendRequestsCollection, requestId);
    const requestSnapshot = await getDoc(requestRef);
    
    if (!requestSnapshot.exists()) {
      throw new Error('Friend request not found');
    }
    
    const requestData = requestSnapshot.data();
    const { fromUid, toUid } = requestData;
    
    // Update request status
    batch.update(requestRef, {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });
    
    // Create connection
    const connectionRef = doc(connectionsCollection);
    batch.set(connectionRef, {
      aUid: fromUid,
      bUid: toUid,
      createdAt: serverTimestamp()
    });
    
    // Update both users' friends lists
    const fromUserRef = doc(usersCollection, fromUid);
    const toUserRef = doc(usersCollection, toUid);
    
    // Get current user data
    const [fromUserDoc, toUserDoc] = await Promise.all([
      getDoc(fromUserRef),
      getDoc(toUserRef)
    ]);
    
    if (fromUserDoc.exists()) {
      const fromUserData = fromUserDoc.data();
      batch.update(fromUserRef, {
        friends: [...(fromUserData.friends || []), toUid],
        sentRequests: (fromUserData.sentRequests || []).filter((id: string) => id !== requestId)
      });
    }
    
    if (toUserDoc.exists()) {
      const toUserData = toUserDoc.data();
      batch.update(toUserRef, {
        friends: [...(toUserData.friends || []), fromUid],
        pendingRequests: (toUserData.pendingRequests || []).filter((id: string) => id !== requestId)
      });
    }
    
    // Add notification to sender
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'request_accepted',
      fromUser: toUid,
      timestamp: serverTimestamp() as Timestamp,
      read: false
    };
    
    const fromUserNotifications = fromUserDoc.exists() ? fromUserDoc.data().notifications || [] : [];
    batch.update(fromUserRef, {
      notifications: [...fromUserNotifications, notification]
    });
    
    await batch.commit();
    console.log('✅ Friend request accepted and connection created');
  } catch (error) {
    console.error('❌ Error accepting friend request:', error);
    throw error;
  }
};

/**
 * Decline friend request
 */
export const declineFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Get the friend request
    const requestRef = doc(friendRequestsCollection, requestId);
    const requestSnapshot = await getDoc(requestRef);
    
    if (!requestSnapshot.exists()) {
      throw new Error('Friend request not found');
    }
    
    const requestData = requestSnapshot.data();
    const { fromUid, toUid } = requestData;
    
    // Update request status
    batch.update(requestRef, {
      status: 'declined',
      updatedAt: serverTimestamp()
    });
    
    // Remove from both users' request lists
    const fromUserRef = doc(usersCollection, fromUid);
    const toUserRef = doc(usersCollection, toUid);
    
    const [fromUserDoc, toUserDoc] = await Promise.all([
      getDoc(fromUserRef),
      getDoc(toUserRef)
    ]);
    
    if (fromUserDoc.exists()) {
      const fromUserData = fromUserDoc.data();
      batch.update(fromUserRef, {
        sentRequests: (fromUserData.sentRequests || []).filter((id: string) => id !== requestId)
      });
    }
    
    if (toUserDoc.exists()) {
      const toUserData = toUserDoc.data();
      batch.update(toUserRef, {
        pendingRequests: (toUserData.pendingRequests || []).filter((id: string) => id !== requestId)
      });
    }
    
    await batch.commit();
    console.log('✅ Friend request declined');
  } catch (error) {
    console.error('❌ Error declining friend request:', error);
    throw error;
  }
};

/**
 * Remove friend connection
 */
export const removeFriend = async (currentUid: string, friendUid: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Find and delete the connection
    const connectionsQuery = query(
      connectionsCollection,
      or(
        where('aUid', '==', currentUid),
        where('bUid', '==', currentUid)
      )
    );
    
    const connectionsSnapshot = await getDocs(connectionsQuery);
    const connectionToDelete = connectionsSnapshot.docs.find(doc => {
      const data = doc.data();
      return (data.aUid === currentUid && data.bUid === friendUid) ||
             (data.aUid === friendUid && data.bUid === currentUid);
    });
    
    if (connectionToDelete) {
      batch.delete(connectionToDelete.ref);
    }
    
    // Remove from both users' friends lists
    const currentUserRef = doc(usersCollection, currentUid);
    const friendUserRef = doc(usersCollection, friendUid);
    
    const [currentUserDoc, friendUserDoc] = await Promise.all([
      getDoc(currentUserRef),
      getDoc(friendUserRef)
    ]);
    
    if (currentUserDoc.exists()) {
      const currentUserData = currentUserDoc.data();
      batch.update(currentUserRef, {
        friends: (currentUserData.friends || []).filter((uid: string) => uid !== friendUid)
      });
    }
    
    if (friendUserDoc.exists()) {
      const friendUserData = friendUserDoc.data();
      batch.update(friendUserRef, {
        friends: (friendUserData.friends || []).filter((uid: string) => uid !== currentUid)
      });
    }
    
    await batch.commit();
    console.log('✅ Friend connection removed');
  } catch (error) {
    console.error('❌ Error removing friend:', error);
    throw error;
  }
};

/**
 * Watch incoming friend requests with user details
 */
export const watchIncomingRequests = (
  uid: string, 
  cb: FriendRequestListener
): (() => void) => {
  try {
    const q = query(
      friendRequestsCollection,
      where('toUid', '==', uid),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const requests: FriendRequestWithUser[] = [];
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // Get user profiles
        const [fromUser, toUser] = await Promise.all([
          getUserProfile(data.fromUid),
          getUserProfile(data.toUid)
        ]);
        
        if (fromUser && toUser) {
          requests.push({
            id: docSnapshot.id,
            fromUid: data.fromUid,
            toUid: data.toUid,
            status: data.status,
            fromUser,
            toUser,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          });
        }
      }
      
      console.log(`📨 Incoming requests updated: ${requests.length} requests`);
      cb(requests);
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
 * Watch user connections with user details
 */
export const watchConnections = (
  uid: string, 
  cb: ConnectionListener
): (() => void) => {
  try {
    const q = query(
      connectionsCollection,
      or(
        where('aUid', '==', uid),
        where('bUid', '==', uid)
      ),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const connections: ConnectionWithUser[] = [];
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // Get user profiles
        const [aUser, bUser] = await Promise.all([
          getUserProfile(data.aUid),
          getUserProfile(data.bUid)
        ]);
        
        if (aUser && bUser) {
          connections.push({
            id: docSnapshot.id,
            aUid: data.aUid,
            bUid: data.bUid,
            aUser,
            bUser,
            createdAt: data.createdAt
          });
        }
      }
      
      console.log(`👥 Connections updated: ${connections.length} connections`);
      cb(connections);
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
 * Watch user notifications
 */
export const watchNotifications = (
  uid: string, 
  cb: NotificationListener
): (() => void) => {
  try {
    const userRef = doc(usersCollection, uid);
    
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const notifications = data.notifications || [];
        console.log(`🔔 Notifications updated: ${notifications.length} notifications`);
        cb(notifications);
      } else {
        cb([]);
      }
    }, (error) => {
      console.error('❌ Error watching notifications:', error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up notifications listener:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (uid: string, notificationId: string): Promise<void> => {
  try {
    const userRef = doc(usersCollection, uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const notifications = userData.notifications || [];
      
      const updatedNotifications = notifications.map((notif: Notification) => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      
      await updateDoc(userRef, {
        notifications: updatedNotifications
      });
      
      console.log('✅ Notification marked as read');
    }
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(usersCollection, uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const notifications = userData.notifications || [];
      
      const updatedNotifications = notifications.map((notif: Notification) => ({
        ...notif,
        read: true
      }));
      
      await updateDoc(userRef, {
        notifications: updatedNotifications
      });
      
      console.log('✅ All notifications marked as read');
    }
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Check if friend request already exists
 */
const checkExistingRequest = async (fromUid: string, toUid: string): Promise<boolean> => {
  try {
    const q = query(
      friendRequestsCollection,
      where('fromUid', '==', fromUid),
      where('toUid', '==', toUid),
      where('status', 'in', ['pending', 'accepted'])
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('❌ Error checking existing request:', error);
    return false;
  }
};

// Export all functions
export {
  getUserProfile,
  createOrUpdateUserProfile,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  watchIncomingRequests,
  watchConnections,
  watchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};
