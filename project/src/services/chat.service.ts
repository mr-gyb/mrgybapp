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
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  ChatRoom, 
  Message, 
  ChatRoomWithUsers, 
  UserProfile,
  ServiceResponse,
  ChatRoomListener,
  MessageListener
} from '../types/friendship';

// Collection references
const chatRoomsCollection = collection(db, 'chatRooms');
const usersCollection = collection(db, 'users');

/**
 * Create a new chat room between two users
 * @param user1Uid - UID of the first user
 * @param user2Uid - UID of the second user
 * @returns Promise<ServiceResponse<string>> - Chat room ID
 */
export const createChatRoom = async (
  user1Uid: string, 
  user2Uid: string
): Promise<ServiceResponse<string>> => {
  try {
    // Check if chat room already exists
    const existingRoom = await findChatRoom(user1Uid, user2Uid);
    if (existingRoom) {
      return {
        success: true,
        data: existingRoom.id
      };
    }
    
    // Create new chat room
    const chatRoomRef = doc(chatRoomsCollection);
    const chatRoomData: Omit<ChatRoom, 'id'> = {
      members: [user1Uid, user2Uid],
      messages: [],
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    };
    
    await updateDoc(chatRoomRef, {
      id: chatRoomRef.id,
      ...chatRoomData
    });
    
    console.log('✅ Chat room created successfully');
    return {
      success: true,
      data: chatRoomRef.id
    };
  } catch (error: any) {
    console.error('❌ Error creating chat room:', error);
    return {
      success: false,
      error: error.message || 'Failed to create chat room'
    };
  }
};

/**
 * Find existing chat room between two users
 * @param user1Uid - UID of the first user
 * @param user2Uid - UID of the second user
 * @returns Promise<ChatRoom | null>
 */
export const findChatRoom = async (
  user1Uid: string, 
  user2Uid: string
): Promise<ChatRoom | null> => {
  try {
    const q = query(
      chatRoomsCollection,
      where('members', 'array-contains', user1Uid)
    );
    
    const snapshot = await getDocs(q);
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      if (data.members.includes(user2Uid) && data.members.length === 2) {
        return {
          id: docSnapshot.id,
          members: data.members,
          messages: data.messages || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error finding chat room:', error);
    return null;
  }
};

/**
 * Send a message to a chat room
 * @param chatRoomId - ID of the chat room
 * @param senderUid - UID of the sender
 * @param content - Message content
 * @returns Promise<ServiceResponse<string>> - Message ID
 */
export const sendMessage = async (
  chatRoomId: string, 
  senderUid: string, 
  content: string
): Promise<ServiceResponse<string>> => {
  try {
    const chatRoomRef = doc(chatRoomsCollection, chatRoomId);
    const chatRoomDoc = await getDoc(chatRoomRef);
    
    if (!chatRoomDoc.exists()) {
      return {
        success: false,
        error: 'Chat room not found'
      };
    }
    
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message: Message = {
      id: messageId,
      sender: senderUid,
      content,
      timestamp: serverTimestamp() as Timestamp,
      readBy: [senderUid]
    };
    
    const chatRoomData = chatRoomDoc.data();
    const updatedMessages = [...(chatRoomData.messages || []), message];
    
    await updateDoc(chatRoomRef, {
      messages: updatedMessages,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Message sent successfully');
    return {
      success: true,
      data: messageId
    };
  } catch (error: any) {
    console.error('❌ Error sending message:', error);
    return {
      success: false,
      error: error.message || 'Failed to send message'
    };
  }
};

/**
 * Watch messages in a chat room
 * @param chatRoomId - ID of the chat room
 * @param callback - Callback function to handle messages
 * @returns Unsubscribe function
 */
export const watchMessages = (
  chatRoomId: string, 
  callback: MessageListener
): (() => void) => {
  try {
    const chatRoomRef = doc(chatRoomsCollection, chatRoomId);
    
    const unsubscribe = onSnapshot(chatRoomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const messages = data.messages || [];
        
        // Sort messages by timestamp
        const sortedMessages = messages.sort((a: Message, b: Message) => {
          const aTime = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const bTime = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return aTime.getTime() - bTime.getTime();
        });
        
        console.log(`💬 Messages updated: ${sortedMessages.length} messages`);
        callback(sortedMessages);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('❌ Error watching messages:', error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up messages listener:', error);
    throw error;
  }
};

/**
 * Watch user's chat rooms
 * @param uid - UID of the user
 * @param callback - Callback function to handle chat rooms
 * @returns Unsubscribe function
 */
export const watchUserChatRooms = (
  uid: string, 
  callback: ChatRoomListener
): (() => void) => {
  try {
    const q = query(
      chatRoomsCollection,
      where('members', 'array-contains', uid),
      orderBy('updatedAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatRooms: ChatRoomWithUsers[] = [];
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // Get member profiles
        const memberProfiles: UserProfile[] = [];
        
        for (const memberUid of data.members) {
          const memberRef = doc(usersCollection, memberUid);
          const memberDoc = await getDoc(memberRef);
          
          if (memberDoc.exists()) {
            const memberData = memberDoc.data();
            memberProfiles.push({
              uid: memberDoc.id,
              name: memberData.name || '',
              businessName: memberData.businessName || '',
              industry: memberData.industry || '',
              email: memberData.email || '',
              friends: memberData.friends || [],
              pendingRequests: memberData.pendingRequests || [],
              sentRequests: memberData.sentRequests || [],
              notifications: memberData.notifications || [],
              createdAt: memberData.createdAt,
              updatedAt: memberData.updatedAt
            });
          }
        }
        
        if (memberProfiles.length === data.members.length) {
          // Get last message
          const messages = data.messages || [];
          const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
          
          // Calculate unread count for current user
          const unreadCount = messages.filter((msg: Message) => 
            msg.sender !== uid && !msg.readBy.includes(uid)
          ).length;
          
          chatRooms.push({
            id: docSnapshot.id,
            members: data.members,
            memberProfiles,
            lastMessage,
            unreadCount,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          });
        }
      }
      
      console.log(`💬 Chat rooms updated: ${chatRooms.length} rooms`);
      callback(chatRooms);
    }, (error) => {
      console.error('❌ Error watching chat rooms:', error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up chat rooms listener:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 * @param chatRoomId - ID of the chat room
 * @param uid - UID of the user
 * @returns Promise<ServiceResponse<void>>
 */
export const markMessagesAsRead = async (
  chatRoomId: string, 
  uid: string
): Promise<ServiceResponse<void>> => {
  try {
    const chatRoomRef = doc(chatRoomsCollection, chatRoomId);
    const chatRoomDoc = await getDoc(chatRoomRef);
    
    if (!chatRoomDoc.exists()) {
      return {
        success: false,
        error: 'Chat room not found'
      };
    }
    
    const data = chatRoomDoc.data();
    const messages = data.messages || [];
    
    // Update messages to include current user in readBy
    const updatedMessages = messages.map((msg: Message) => {
      if (msg.sender !== uid && !msg.readBy.includes(uid)) {
        return {
          ...msg,
          readBy: [...msg.readBy, uid]
        };
      }
      return msg;
    });
    
    await updateDoc(chatRoomRef, {
      messages: updatedMessages,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Messages marked as read');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error marking messages as read:', error);
    return {
      success: false,
      error: error.message || 'Failed to mark messages as read'
    };
  }
};

/**
 * Get or create chat room between two users
 * @param user1Uid - UID of the first user
 * @param user2Uid - UID of the second user
 * @returns Promise<ServiceResponse<string>> - Chat room ID
 */
export const getOrCreateChatRoom = async (
  user1Uid: string, 
  user2Uid: string
): Promise<ServiceResponse<string>> => {
  try {
    // Try to find existing chat room
    const existingRoom = await findChatRoom(user1Uid, user2Uid);
    if (existingRoom) {
      return {
        success: true,
        data: existingRoom.id
      };
    }
    
    // Create new chat room
    return await createChatRoom(user1Uid, user2Uid);
  } catch (error: any) {
    console.error('❌ Error getting or creating chat room:', error);
    return {
      success: false,
      error: error.message || 'Failed to get or create chat room'
    };
  }
};

// Export all functions
export {
  createChatRoom,
  findChatRoom,
  sendMessage,
  watchMessages,
  watchUserChatRooms,
  markMessagesAsRead,
  getOrCreateChatRoom
};