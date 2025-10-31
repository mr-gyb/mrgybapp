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
  limit,
  orderBy,
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChatRoom, ChatMessage, UserProfile } from '../types/friendships';

const chatRoomsCollection = collection(db, 'chatRooms');
const usersCollection = collection(db, 'users');

/**
 * Generate a deterministic pair key for 1:1 chats
 */
const generatePairKey = (uidA: string, uidB: string): string => {
  return [uidA, uidB].sort().join('_');
};

/**
 * Create or get a direct chat room between two users
 * Only called AFTER friend request is accepted
 */
export const createOrGetDirectChat = async (aUid: string, bUid: string): Promise<string> => {
  try {
    const pairKey = generatePairKey(aUid, bUid);
    
    // Query for existing room with this pair
    const q = query(chatRoomsCollection, where('pairKey', '==', pairKey), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      console.log('✅ Existing chat room found:', snapshot.docs[0].id);
      return snapshot.docs[0].id;
    }
    
    // Create new room
    const newRoomRef = doc(chatRoomsCollection);
    const newRoom: ChatRoom = {
      id: newRoomRef.id,
      members: [aUid, bUid],
      createdAt: Timestamp.now(),
      lastMessageAt: null,
      pairKey: pairKey,
      archivedBy: {},
      deletedBy: {},
      canHardDelete: [aUid, bUid] // Both users can hard delete
    };
    await updateDoc(newRoomRef, newRoom);
    
    console.log('✅ New chat room created:', newRoom.id);
    return newRoom.id;
  } catch (error) {
    console.error('❌ Error creating or getting direct chat room:', error);
    throw error;
  }
};

/**
 * Send a message to a chat room
 */
export const sendMessage = async (roomId: string, senderId: string, text: string): Promise<void> => {
  try {
    // Verify sender is a member of the room
    const roomRef = doc(chatRoomsCollection, roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      throw new Error('Chat room not found');
    }
    const roomData = roomDoc.data() as ChatRoom;
    if (!roomData.members.includes(senderId)) {
      throw new Error('Sender is not a member of this chat room');
    }

    // Add message to the room's messages subcollection
    const messagesSubcollection = collection(roomRef, 'messages');
    await addDoc(messagesSubcollection, {
      senderId,
      text,
      createdAt: serverTimestamp()
    });

    // Update lastMessageAt for the chat room
    await updateDoc(roomRef, {
      lastMessageAt: serverTimestamp()
    });

    console.log('✅ Message sent to room:', roomId);
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
};

/**
 * Watch messages in a chat room in real-time
 */
export const watchRoom = (
  roomId: string, 
  cb: (messages: ChatMessage[]) => void
): (() => void) => {
  try {
    const roomRef = doc(chatRoomsCollection, roomId);
    const messagesSubcollection = collection(roomRef, 'messages');
    
    const q = query(
      messagesSubcollection,
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = snapshot.docs.map(doc => ({
        id: doc.id,
        roomId: roomId,
        senderId: doc.data().senderId,
        text: doc.data().text,
        createdAt: doc.data().createdAt as Timestamp
      }));
      cb(messages);
    }, (error) => {
      console.error('❌ Error watching chat room messages:', error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up chat room messages listener:', error);
    throw error;
  }
};

/**
 * Watch user's chat rooms in real-time (excluding archived ones)
 * Only shows chats where chatRooms/{room} exists and members contains currentUid
 */
export const watchUserChats = (
  uid: string, 
  cb: (rooms: ChatRoom[]) => void
): (() => void) => {
  try {
    // Query without orderBy to avoid index requirement - we'll sort client-side
    const q = query(
      chatRoomsCollection,
      where('members', 'array-contains', uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rooms: ChatRoom[] = snapshot.docs
        .map(doc => ({
          id: doc.id,
          members: doc.data().members,
          createdAt: doc.data().createdAt as Timestamp,
          lastMessageAt: doc.data().lastMessageAt as Timestamp | null,
          pairKey: doc.data().pairKey,
          archivedBy: doc.data().archivedBy || {},
          deletedBy: doc.data().deletedBy || {},
          canHardDelete: doc.data().canHardDelete || []
        }))
        .filter(room => 
          // Only show rooms where user is a member AND not archived or deleted by this user
          room.members.includes(uid) && !room.archivedBy[uid] && !room.deletedBy[uid]
        )
        // Sort client-side by lastMessageAt (newest first)
        .sort((a, b) => {
          if (!a.lastMessageAt && !b.lastMessageAt) return 0;
          if (!a.lastMessageAt) return 1;
          if (!b.lastMessageAt) return -1;
          return b.lastMessageAt.toMillis() - a.lastMessageAt.toMillis();
        });
      
      console.log(`📋 Found ${rooms.length} active chat rooms for user ${uid}`);
      console.log('Chat threads (visible):', rooms.map(t => t.id));
      cb(rooms);
    }, (error) => {
      console.error('❌ Error watching user chat rooms:', error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up user chat rooms listener:', error);
    throw error;
  }
};

/**
 * Archive a chat for a specific user (soft delete)
 * Sets chatRooms/{id}.archivedBy.{uid} = true
 */
export const archiveChat = async (chatId: string, uid: string): Promise<void> => {
  try {
    const roomRef = doc(chatRoomsCollection, chatId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      throw new Error('Chat room not found');
    }
    
    const roomData = roomDoc.data() as ChatRoom;
    if (!roomData.members.includes(uid)) {
      throw new Error('User is not a member of this chat room');
    }
    
    const archivedBy = roomData.archivedBy || {};
    archivedBy[uid] = true;
    
    await setDoc(roomRef, {
      archivedBy: archivedBy
    }, { merge: true });
    
    console.log(`✅ Chat ${chatId} archived for user ${uid}`);
  } catch (error) {
    console.error('❌ Error archiving chat:', error);
    throw error;
  }
};

/**
 * Unarchive a chat for a specific user
 * Removes chatRooms/{id}.archivedBy.{uid}
 */
export const unarchiveChat = async (chatId: string, uid: string): Promise<void> => {
  try {
    const roomRef = doc(chatRoomsCollection, chatId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      throw new Error('Chat room not found');
    }
    
    const roomData = roomDoc.data() as ChatRoom;
    if (!roomData.members.includes(uid)) {
      throw new Error('User is not a member of this chat room');
    }
    
    const archivedBy = roomData.archivedBy || {};
    delete archivedBy[uid];
    
    await setDoc(roomRef, {
      archivedBy: archivedBy
    }, { merge: true });
    
    console.log(`✅ Chat ${chatId} unarchived for user ${uid}`);
  } catch (error) {
    console.error('❌ Error unarchiving chat:', error);
    throw error;
  }
};

/**
 * Permanently delete a chat for everyone (hard delete)
 * Removes messages and room (admin / allowed users only)
 */
export const deleteChatForEveryone = async (chatId: string, uid: string): Promise<void> => {
  try {
    const roomRef = doc(chatRoomsCollection, chatId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      throw new Error('Chat room not found');
    }
    
    const roomData = roomDoc.data() as ChatRoom;
    if (!roomData.canHardDelete?.includes(uid)) {
      throw new Error('User is not authorized to delete this chat');
    }
    
    console.log(`🗑️ Deleting chat ${chatId} and all messages...`);
    
    // Delete all messages in the chat
    const messagesSubcollection = collection(roomRef, 'messages');
    const messagesSnapshot = await getDocs(messagesSubcollection);
    
    const deletePromises = messagesSnapshot.docs.map(messageDoc => 
      deleteDoc(doc(messagesSubcollection, messageDoc.id))
    );
    
    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${messagesSnapshot.docs.length} messages`);
    
    // Delete the chat room itself
    await deleteDoc(roomRef);
    console.log(`✅ Chat room ${chatId} permanently deleted`);
  } catch (error) {
    console.error('❌ Error deleting chat:', error);
    throw error;
  }
};

/**
 * Get room details by ID
 */
export const getRoom = async (roomId: string): Promise<ChatRoom | null> => {
  try {
    const roomRef = doc(chatRoomsCollection, roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      return null;
    }
    
    const data = roomDoc.data();
    return {
      id: roomDoc.id,
      members: data.members,
      createdAt: data.createdAt as Timestamp,
      lastMessageAt: data.lastMessageAt as Timestamp | null,
      pairKey: data.pairKey,
      archivedBy: data.archivedBy || {},
    deletedBy: data.deletedBy || {},
      canHardDelete: data.canHardDelete || []
    };
  } catch (error) {
    console.error('❌ Error getting room:', error);
    throw error;
  }
};

/**
 * Watch archived chats for a user
 */
export const watchArchivedChats = (
  uid: string, 
  cb: (rooms: ChatRoom[]) => void
): (() => void) => {
  try {
    // Query without orderBy to avoid index requirement - we'll sort client-side
    const q = query(
      chatRoomsCollection,
      where('members', 'array-contains', uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rooms: ChatRoom[] = snapshot.docs
        .map(doc => ({
          id: doc.id,
          members: doc.data().members,
          createdAt: doc.data().createdAt as Timestamp,
          lastMessageAt: doc.data().lastMessageAt as Timestamp | null,
          pairKey: doc.data().pairKey,
          archivedBy: doc.data().archivedBy || {},
          deletedBy: doc.data().deletedBy || {},
          canHardDelete: doc.data().canHardDelete || []
        }))
        .filter(room => room.archivedBy[uid]) // Only archived chats for this user
        // Sort client-side by lastMessageAt (newest first)
        .sort((a, b) => {
          if (!a.lastMessageAt && !b.lastMessageAt) return 0;
          if (!a.lastMessageAt) return 1;
          if (!b.lastMessageAt) return -1;
          return b.lastMessageAt.toMillis() - a.lastMessageAt.toMillis();
        });
      
      cb(rooms);
    }, (error) => {
      console.error('❌ Error watching archived chat rooms:', error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up archived chat rooms listener:', error);
    throw error;
  }
};

/**
 * Soft-delete a chat for a specific user.
 * Sets chatRooms/{id}.deletedBy.{uid} = true and hides chat for that user via watchUserChats.
 * If all members have deleted the chat, permanently delete the chat and its messages.
 */
export const deleteChatForUser = async (chatId: string, uid: string): Promise<void> => {
  try {
    const roomRef = doc(chatRoomsCollection, chatId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      throw new Error('Chat room not found');
    }
    
    const roomData = roomDoc.data() as ChatRoom;
    if (!roomData.members.includes(uid)) {
      throw new Error('User is not a member of this chat room');
    }
    
    const deletedBy = { ...(roomData.deletedBy || {}) } as { [key: string]: boolean };
    deletedBy[uid] = true;
    
    await setDoc(roomRef, { deletedBy }, { merge: true });
    console.log(`✅ Chat ${chatId} marked as deleted for user ${uid}`);
    
    const allMembersDeleted = roomData.members.every(memberId => deletedBy[memberId]);
    if (allMembersDeleted) {
      // Permanently delete the chat and messages when both users deleted
      console.log('🧹 Both members deleted this chat; performing hard delete');
      // Delete all messages
      const messagesSubcollection = collection(roomRef, 'messages');
      const messagesSnapshot = await getDocs(messagesSubcollection);
      await Promise.all(messagesSnapshot.docs.map(messageDoc => deleteDoc(doc(messagesSubcollection, messageDoc.id))));
      // Delete the chat room
      await deleteDoc(roomRef);
      console.log(`✅ Chat room ${chatId} permanently deleted after both users deleted`);
    }
  } catch (error) {
    console.error('❌ Error deleting chat for user:', error);
    throw error;
  }
};