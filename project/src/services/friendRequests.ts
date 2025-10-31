import { 
  collection, 
  doc, 
  addDoc,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createOrGetDirectChat, deleteChatForEveryone } from './chats';
import { createFriendRequestNotification, createFriendRequestSentNotification } from './notifications';

const usersCollection = collection(db, 'users');

/**
 * Get user name by UID
 */
async function getUserName(uid: string): Promise<string> {
  try {
    const userDoc = await getDoc(doc(usersCollection, uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.name || data.displayName || data.email || 'Unknown User';
    }
    return 'Unknown User';
  } catch (error) {
    console.error('Error fetching user name:', error);
    return 'Unknown User';
  }
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

const friendRequestsCollection = collection(db, 'friendRequests');

/**
 * Send a friend request
 * Creates a normalized friendRequest document
 */
export async function sendFriendRequest(senderId: string, receiverId: string): Promise<string> {
  console.log('📤 Sending friend request from', senderId, 'to', receiverId);
  
  try {
    // Check if a request already exists
    const existingQuery = query(
      friendRequestsCollection,
      where('senderId', '==', senderId),
      where('receiverId', '==', receiverId),
      where('status', '==', 'pending')
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      console.log('⚠️ Friend request already exists');
      return existingSnapshot.docs[0].id;
    }
    
    // Create new friend request
    const newRequest = {
      senderId,
      receiverId,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(friendRequestsCollection, newRequest);
    const payload = { id: docRef.id, senderId, receiverId, status: 'pending' };
    console.log('✅ Friend request created:', docRef.id);
    console.log('FR lifecycle -> created', payload);
    console.log('Friend request added:', payload);
    console.log('📤 Sending friend request - senderId:', senderId, 'receiverId:', receiverId);
    console.log('📤 Request document ID:', docRef.id);
    console.log('📤 Real-time listener should detect this change and update badge count');
    
    // Create notification for receiver
    try {
      const senderName = await getUserName(senderId);
      const receiverName = await getUserName(receiverId);
      await createFriendRequestNotification(senderId, receiverId, senderName);
      await createFriendRequestSentNotification(senderId, receiverId, receiverName);
      console.log('🔔 Friend request notifications created (receiver + sender)');
    } catch (notifErr) {
      console.warn('⚠️ Failed to create friend request notifications:', notifErr);
    }

    return docRef.id;
  } catch (error) {
    console.error('❌ Error sending friend request:', error);
    throw error;
  }
}

/**
 * Accept a friend request
 * Updates status to 'accepted' and creates chat room
 */
export async function acceptFriendRequest(requestId: string, currentUserId: string): Promise<string | null> {
  console.log('✅ Accepting friend request:', requestId);
  
  try {
    const requestRef = doc(friendRequestsCollection, requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      throw new Error('Friend request not found');
    }
    
    const requestData = requestDoc.data();
    if (requestData.receiverId !== currentUserId) {
      throw new Error('Unauthorized: You can only accept requests sent to you');
    }
    
    if (requestData.status !== 'pending') {
      throw new Error('Friend request is not pending');
    }
    
    const senderId = requestData.senderId;
    const receiverId = requestData.receiverId;
    
    // Update status to accepted
    await updateDoc(requestRef, {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Friend request accepted:', requestId);
    console.log('FR lifecycle -> accepted', requestId);
    console.log('✅ Accept mutation complete - listener should update badge count automatically');
    
    // Create or get chat room after acceptance
    const chatRoomId = await createOrGetDirectChat(senderId, receiverId);
    console.log('✅ Chat room created/retrieved:', chatRoomId);
    
    return chatRoomId;
  } catch (error) {
    console.error('❌ Error accepting friend request:', error);
    throw error;
  }
}

/**
 * Decline a friend request
 * Updates status to 'declined' and ensures no chat exists
 */
export async function declineFriendRequest(requestId: string, currentUserId: string): Promise<void> {
  console.log('❌ Declining friend request:', requestId);
  
  try {
    const requestRef = doc(friendRequestsCollection, requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      throw new Error('Friend request not found');
    }
    
    const requestData = requestDoc.data();
    if (requestData.receiverId !== currentUserId) {
      throw new Error('Unauthorized: You can only decline requests sent to you');
    }
    
    // Requirement: remove the request entirely so it disappears from both UIs
    await deleteDoc(requestRef);
    console.log('✅ Friend request removed from database:', requestId);
    console.log('FR lifecycle -> removed', requestId);
    console.log('✅ Decline delete complete - real-time listeners will remove it from UI');
  } catch (error) {
    console.error('❌ Error declining friend request:', error);
    throw error;
  }
}

/**
 * Watch pending incoming requests for a user in real-time
 */
export function watchPendingIncomingRequests(
  receiverId: string,
  callback: (requests: FriendRequest[]) => void
): () => void {
  console.log('👂 Setting up listener for pending incoming requests for:', receiverId);
  console.log('👂 Real-time listener active - will update on any changes to friendRequests collection');
  
  const q = query(
    friendRequestsCollection,
    where('receiverId', '==', receiverId),
    where('status', '==', 'pending')
  );
  
  console.log('👂 Query created:', {
    collection: 'friendRequests',
    filters: {
      receiverId,
      status: 'pending'
    }
  });
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    console.log('📡 onSnapshot triggered for receiverId:', receiverId);
    console.log('📡 Snapshot has', snapshot.docs.length, 'documents');
    
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FriendRequest));
    
    console.log('📋 Raw snapshot docs:', snapshot.docs.map(d => ({ id: d.id, data: d.data() })));
    console.log('📋 Friend request added:', requests);
    console.log('📋 Pending requests state:', requests);
    console.log('📋 Pending requests count:', requests.length);
    console.log('📋 Badge count rendering:', requests.length);
    console.log('📋 Chat threads (visible):', requests.map(r => r.id));
    
    // Log each request individually
    requests.forEach((req, index) => {
      console.log(`  Request ${index + 1}:`, {
        id: req.id,
        senderId: req.senderId,
        receiverId: req.receiverId,
        status: req.status,
        createdAt: req.createdAt
      });
    });
    
    callback(requests);
  }, (error) => {
    console.error('❌ Error watching pending incoming requests:', error);
    console.error('❌ Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
  });
  
  return unsubscribe;
}

/**
 * Watch pending sent requests for a user in real-time
 */
export function watchPendingSentRequests(
  senderId: string,
  callback: (requests: FriendRequest[]) => void
): () => void {
  console.log('👂 Setting up listener for pending sent requests for:', senderId);
  
  const q = query(
    friendRequestsCollection,
    where('senderId', '==', senderId),
    where('status', '==', 'pending')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FriendRequest));
    
    callback(requests);
  }, (error) => {
    console.error('❌ Error watching pending sent requests:', error);
  });
  
  return unsubscribe;
}
