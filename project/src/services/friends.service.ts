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
  FriendRequest, 
  FriendRequestWithUser,
  ServiceResponse,
  FriendRequestListener
} from '../types/friendship';

// Collection references
const usersCollection = collection(db, 'users');
const friendRequestsCollection = collection(db, 'friendRequests');

/**
 * Send a friend request from one user to another
 * @param fromUid - UID of the user sending the request
 * @param toUid - UID of the user receiving the request
 * @returns Promise<ServiceResponse<void>>
 */
export const sendFriendRequest = async (
  fromUid: string, 
  toUid: string
): Promise<ServiceResponse<void>> => {
  try {
    const batch = writeBatch(db);
    
    // Check if request already exists
    const existingRequest = await checkExistingRequest(fromUid, toUid);
    if (existingRequest) {
      return {
        success: false,
        error: 'Friend request already exists between these users'
      };
    }
    
    // Create friend request document
    const requestRef = doc(friendRequestsCollection);
    const requestData: Omit<FriendRequest, 'id'> = {
      fromUid,
      toUid,
      status: 'pending',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    };
    batch.set(requestRef, requestData);
    
    // Update sender's sentRequests
    const fromUserRef = doc(usersCollection, fromUid);
    const fromUserDoc = await getDoc(fromUserRef);
    if (fromUserDoc.exists()) {
      const fromUserData = fromUserDoc.data();
      batch.update(fromUserRef, {
        sentRequests: [...(fromUserData.sentRequests || []), requestRef.id],
        updatedAt: serverTimestamp()
      });
    }
    
    // Update receiver's pendingRequests
    const toUserRef = doc(usersCollection, toUid);
    const toUserDoc = await getDoc(toUserRef);
    if (toUserDoc.exists()) {
      const toUserData = toUserDoc.data();
      batch.update(toUserRef, {
        pendingRequests: [...(toUserData.pendingRequests || []), requestRef.id],
        updatedAt: serverTimestamp()
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
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending friend request:', error);
    return {
      success: false,
      error: error.message || 'Failed to send friend request'
    };
  }
};

/**
 * Accept a friend request
 * @param requestId - ID of the friend request to accept
 * @returns Promise<ServiceResponse<void>>
 */
export const acceptFriendRequest = async (
  requestId: string
): Promise<ServiceResponse<void>> => {
  try {
    const batch = writeBatch(db);
    
    // Get the friend request
    const requestRef = doc(friendRequestsCollection, requestId);
    const requestSnapshot = await getDoc(requestRef);
    
    if (!requestSnapshot.exists()) {
      return {
        success: false,
        error: 'Friend request not found'
      };
    }
    
    const requestData = requestSnapshot.data();
    const { fromUid, toUid } = requestData;
    
    // Update request status
    batch.update(requestRef, {
      status: 'accepted',
      updatedAt: serverTimestamp()
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
        sentRequests: (fromUserData.sentRequests || []).filter((id: string) => id !== requestId),
        updatedAt: serverTimestamp()
      });
    }
    
    if (toUserDoc.exists()) {
      const toUserData = toUserDoc.data();
      batch.update(toUserRef, {
        friends: [...(toUserData.friends || []), fromUid],
        pendingRequests: (toUserData.pendingRequests || []).filter((id: string) => id !== requestId),
        updatedAt: serverTimestamp()
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
    
    console.log('✅ Friend request accepted');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error accepting friend request:', error);
    return {
      success: false,
      error: error.message || 'Failed to accept friend request'
    };
  }
};

/**
 * Decline a friend request
 * @param requestId - ID of the friend request to decline
 * @returns Promise<ServiceResponse<void>>
 */
export const declineFriendRequest = async (
  requestId: string
): Promise<ServiceResponse<void>> => {
  try {
    const batch = writeBatch(db);
    
    // Get the friend request
    const requestRef = doc(friendRequestsCollection, requestId);
    const requestSnapshot = await getDoc(requestRef);
    
    if (!requestSnapshot.exists()) {
      return {
        success: false,
        error: 'Friend request not found'
      };
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
        sentRequests: (fromUserData.sentRequests || []).filter((id: string) => id !== requestId),
        updatedAt: serverTimestamp()
      });
    }
    
    if (toUserDoc.exists()) {
      const toUserData = toUserDoc.data();
      batch.update(toUserRef, {
        pendingRequests: (toUserData.pendingRequests || []).filter((id: string) => id !== requestId),
        updatedAt: serverTimestamp()
      });
    }
    
    await batch.commit();
    
    console.log('✅ Friend request declined');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error declining friend request:', error);
    return {
      success: false,
      error: error.message || 'Failed to decline friend request'
    };
  }
};

/**
 * Get friends list for a user
 * @param uid - UID of the user
 * @returns Promise<ServiceResponse<UserProfile[]>>
 */
export const getFriendsList = async (
  uid: string
): Promise<ServiceResponse<UserProfile[]>> => {
  try {
    const userRef = doc(usersCollection, uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    const userData = userDoc.data();
    const friendsUids = userData.friends || [];
    
    if (friendsUids.length === 0) {
      return {
        success: true,
        data: []
      };
    }
    
    // Get friend profiles
    const friendProfiles: UserProfile[] = [];
    
    for (const friendUid of friendsUids) {
      const friendRef = doc(usersCollection, friendUid);
      const friendDoc = await getDoc(friendRef);
      
      if (friendDoc.exists()) {
        const friendData = friendDoc.data();
        friendProfiles.push({
          uid: friendDoc.id,
          name: friendData.name || '',
          businessName: friendData.businessName || '',
          industry: friendData.industry || '',
          email: friendData.email || '',
          friends: friendData.friends || [],
          pendingRequests: friendData.pendingRequests || [],
          sentRequests: friendData.sentRequests || [],
          notifications: friendData.notifications || [],
          createdAt: friendData.createdAt,
          updatedAt: friendData.updatedAt
        });
      }
    }
    
    console.log(`✅ Retrieved ${friendProfiles.length} friends for user ${uid}`);
    return {
      success: true,
      data: friendProfiles
    };
  } catch (error: any) {
    console.error('❌ Error getting friends list:', error);
    return {
      success: false,
      error: error.message || 'Failed to get friends list'
    };
  }
};

/**
 * Watch incoming friend requests in real-time
 * @param uid - UID of the user to watch requests for
 * @param callback - Callback function to handle the requests array
 * @returns Unsubscribe function
 */
export const watchIncomingRequests = (
  uid: string, 
  callback: FriendRequestListener
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
        const [fromUserDoc, toUserDoc] = await Promise.all([
          getDoc(doc(usersCollection, data.fromUid)),
          getDoc(doc(usersCollection, data.toUid))
        ]);
        
        if (fromUserDoc.exists() && toUserDoc.exists()) {
          const fromUserData = fromUserDoc.data();
          const toUserData = toUserDoc.data();
          
          const fromUser: UserProfile = {
            uid: fromUserDoc.id,
            name: fromUserData.name || '',
            businessName: fromUserData.businessName || '',
            industry: fromUserData.industry || '',
            email: fromUserData.email || '',
            friends: fromUserData.friends || [],
            pendingRequests: fromUserData.pendingRequests || [],
            sentRequests: fromUserData.sentRequests || [],
            notifications: fromUserData.notifications || [],
            createdAt: fromUserData.createdAt,
            updatedAt: fromUserData.updatedAt
          };
          
          const toUser: UserProfile = {
            uid: toUserDoc.id,
            name: toUserData.name || '',
            businessName: toUserData.businessName || '',
            industry: toUserData.industry || '',
            email: toUserData.email || '',
            friends: toUserData.friends || [],
            pendingRequests: toUserData.pendingRequests || [],
            sentRequests: toUserData.sentRequests || [],
            notifications: toUserData.notifications || [],
            createdAt: toUserData.createdAt,
            updatedAt: toUserData.updatedAt
          };
          
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
      callback(requests);
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
 * Check if friend request already exists between two users
 * @param fromUid - UID of the user sending the request
 * @param toUid - UID of the user receiving the request
 * @returns Promise<boolean>
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
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriendsList,
  watchIncomingRequests
};
