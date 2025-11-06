import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  getDocs,
  getDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Types
export interface ChatRoom {
  id: string;
  members: string[];
  createdAt: Timestamp;
  lastMessageAt?: Timestamp | null;
  pairKey?: string;
  archivedBy?: { [uid: string]: boolean };
  deletedBy?: { [uid: string]: boolean };
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
}

// Collection references
const chatRoomsCollection = collection(db, 'chatRooms');

/**
 * Generate a deterministic pair key for two users
 * Ensures the same key regardless of order of UIDs
 */
const generatePairKey = (uidA: string, uidB: string): string => {
  const sorted = [uidA, uidB].sort();
  return `${sorted[0]}_${sorted[1]}`;
};

/**
 * Ensure a direct room exists between two users
 * Returns the room ID (existing or newly created)
 */
const ensureDirectRoom = async (userA: string, userB: string): Promise<string> => {
  try {
    const pairKey = generatePairKey(userA, userB);
    
    // Query for existing room with this pair
    const q = query(
      chatRoomsCollection,
      where('pairKey', '==', pairKey)
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // Room exists, return its ID
      const existingRoom = snapshot.docs[0];
      console.log('✅ Existing chat room found:', existingRoom.id);
      return existingRoom.id;
    }
    
    // Create new room
    const roomData = {
      members: [userA, userB],
      createdAt: serverTimestamp(),
      lastMessageAt: null,
      pairKey: pairKey
    };
    
    const roomRef = await addDoc(chatRoomsCollection, roomData);
    console.log('✅ New chat room created:', roomRef.id);
    
    return roomRef.id;
  } catch (error) {
    console.error('❌ Error ensuring direct room:', error);
    throw error;
  }
};

/**
 * Send a message to a chat room
 */
const sendMessage = async (roomId: string, senderId: string, text: string): Promise<void> => {
  try {
    // Verify sender is a member of the room
    const roomRef = doc(chatRoomsCollection, roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      throw new Error('Chat room not found');
    }
    
    const roomData = roomDoc.data();
    if (!roomData.members.includes(senderId)) {
      throw new Error('User is not a member of this chat room');
    }
    
    // Add message to the room's messages subcollection
    const messagesSubcollection = collection(roomRef, 'messages');
    const messageData = {
      senderId: senderId,
      text: text.trim(),
      createdAt: serverTimestamp()
    };
    
    await addDoc(messagesSubcollection, messageData);
    
    // Update room's lastMessageAt
    await updateDoc(roomRef, {
      lastMessageAt: serverTimestamp()
    });
    
    console.log('✅ Message sent successfully');
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
};

/**
 * Watch messages in a chat room in real-time
 */
const watchRoom = (
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
      const messages: ChatMessage[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          roomId: roomId,
          senderId: data.senderId,
          text: data.text,
          createdAt: data.createdAt
        });
      });
      
      console.log(`💬 Messages updated for room ${roomId}: ${messages.length} messages`);
      cb(messages);
    }, (error) => {
      console.error('❌ Error watching room messages:', error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up room listener:', error);
    throw error;
  }
};

/**
 * Get user's chat rooms
 */
const getUserChatRooms = async (userId: string): Promise<ChatRoom[]> => {
  try {
    const q = query(
      chatRoomsCollection,
      where('members', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const rooms: ChatRoom[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      rooms.push({
        id: doc.id,
        members: data.members,
        createdAt: data.createdAt,
        lastMessageAt: data.lastMessageAt,
        pairKey: data.pairKey
      });
    });
    
    console.log(`📋 Found ${rooms.length} chat rooms for user ${userId}`);
    return rooms;
  } catch (error) {
    console.error('❌ Error getting user chat rooms:', error);
    return [];
  }
};

/**
 * Watch user's chat rooms in real-time
 */
const watchUserChatRooms = (
  userId: string, 
  cb: (rooms: ChatRoom[]) => void
): (() => void) => {
  try {
    const q = query(
      chatRoomsCollection,
      where('members', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rooms: ChatRoom[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        rooms.push({
          id: doc.id,
          members: data.members,
          createdAt: data.createdAt,
          lastMessageAt: data.lastMessageAt,
          pairKey: data.pairKey
        });
      });
      
      console.log(`📋 User chat rooms updated: ${rooms.length} rooms`);
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
 * Get room details by ID
 */
const getRoom = async (roomId: string): Promise<ChatRoom | null> => {
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
      createdAt: data.createdAt,
      lastMessageAt: data.lastMessageAt,
      pairKey: data.pairKey
    };
  } catch (error) {
    console.error('❌ Error getting room:', error);
    return null;
  }
};

/**
 * Archive a chat for a specific user (soft delete)
 */
const archiveChat = async (chatId: string, uid: string): Promise<void> => {
  try {
    const roomRef = doc(chatRoomsCollection, chatId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      throw new Error('Chat room not found');
    }
    
    const roomData = roomDoc.data();
    if (!roomData.members.includes(uid)) {
      throw new Error('User is not a member of this chat room');
    }
    
    const archivedBy = roomData.archivedBy || {};
    archivedBy[uid] = true;
    
    await updateDoc(roomRef, {
      archivedBy,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Chat ${chatId} archived for user ${uid}`);
  } catch (error) {
    console.error('❌ Error archiving chat:', error);
    throw error;
  }
};

/**
 * Unarchive a chat for a specific user
 */
const unarchiveChat = async (chatId: string, uid: string): Promise<void> => {
  try {
    const roomRef = doc(chatRoomsCollection, chatId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      throw new Error('Chat room not found');
    }
    
    const roomData = roomDoc.data();
    const archivedBy = roomData.archivedBy || {};
    delete archivedBy[uid];
    
    await updateDoc(roomRef, {
      archivedBy,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Chat ${chatId} unarchived for user ${uid}`);
  } catch (error) {
    console.error('❌ Error unarchiving chat:', error);
    throw error;
  }
};

/**
 * Delete a chat completely (hard delete)
 * Deletes all messages and the room document
 */
const deleteChat = async (chatId: string, uid: string): Promise<void> => {
  try {
    const roomRef = doc(chatRoomsCollection, chatId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      throw new Error('Chat room not found');
    }
    
    const roomData = roomDoc.data();
    if (!roomData.members.includes(uid)) {
      throw new Error('User is not a member of this chat room');
    }
    
    // Delete all messages in the chat
    const messagesSubcollection = collection(roomRef, 'messages');
    const messagesSnapshot = await getDocs(query(messagesSubcollection));
    
    const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Delete the chat room document
    await deleteDoc(roomRef);
    
    console.log(`✅ Chat ${chatId} and all messages deleted permanently`);
  } catch (error) {
    console.error('❌ Error deleting chat:', error);
    throw error;
  }
};

// Export all functions
export {
  ensureDirectRoom,
  sendMessage,
  watchRoom,
  getUserChatRooms,
  watchUserChatRooms,
  getRoom,
  archiveChat,
  unarchiveChat,
  deleteChat
};
