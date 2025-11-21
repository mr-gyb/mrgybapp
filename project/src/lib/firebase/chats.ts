import { 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  arrayUnion, 
  runTransaction 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Chat, ChatParticipant, Message } from '../../types/chat';
import { AI_USERS } from '../../types/user';

const buildParticipantIds = (participants: ChatParticipant[] = []): string[] =>
  participants.map((participant) => participant.uid);

export const createChat = async (
  userId: string, 
  title: string = 'New Chat',
  participants: ChatParticipant[] = []
): Promise<Chat | null> => {
  try {
    const ownerExists = participants.some(participant => participant.uid === userId);
    const enrichedParticipants = ownerExists
      ? participants
      : [
          ...participants,
          {
            uid: userId,
            type: 'user',
            displayName: 'You',
            joinedAt: new Date().toISOString()
          }
        ];

    const chatData = {
      title,
      userId,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      participants: enrichedParticipants,
      participantIds: buildParticipantIds(enrichedParticipants),
      agents: []
    };
    
    const chatRef = await addDoc(collection(db, 'chats'), chatData);
    
    return {
      id: chatRef.id,
      title,
      userId,
      createdAt: chatData.createdAt,
      updatedAt: chatData.updatedAt,
      participants: enrichedParticipants,
      messages: []
    };
  } catch (error) {
    console.error('Error creating chat:', error);
    return null;
  }
};

export const getChat = async (chatId: string): Promise<Chat | null> => {
  try {
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    
    if (!chatDoc.exists()) {
      return null;
    }
    
    const chatData = chatDoc.data();
    
    // Get messages for this chat
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    
    return {
      id: chatDoc.id,
      title: chatData.title,
      userId: chatData.userId,
      createdAt: chatData.createdAt,
      updatedAt: chatData.updatedAt,
      participants: chatData.participants || [],
      agents: chatData.agents || [],
      participantIds: chatData.participantIds || buildParticipantIds(chatData.participants || []),
      messages
    };
  } catch (error) {
    console.error('Error getting chat:', error);
    return null;
  }
};

export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const chatsSnapshot = await getDocs(chatsQuery);
    const chats: Chat[] = [];
    
    for (const chatDoc of chatsSnapshot.docs) {
      const chatData = chatDoc.data();
      
      // Get messages for this chat
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatDoc.id),
        orderBy('createdAt', 'asc')
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const messages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      chats.push({
        id: chatDoc.id,
        title: chatData.title,
        userId: chatData.userId,
        createdAt: chatData.createdAt,
        updatedAt: chatData.updatedAt,
        participants: chatData.participants || [],
        agents: chatData.agents || [],
        participantIds: chatData.participantIds || buildParticipantIds(chatData.participants || []),
        messages
      });
    }
    
    return chats;
  } catch (error) {
    console.error('Error getting user chats:', error);
    return [];
  }
};

export const addMessage = async (
  chatId: string,
  content: string,
  role: 'user' | 'assistant' | 'system',
  senderId?: string,
  aiAgent?: string | null
): Promise<Message | null> => {
  try {
    const messageData = {
      chatId,
      content,
      role,
      senderId,
      aiAgent,
      createdAt: new Date().toISOString()
    };
    
    const messageRef = await addDoc(collection(db, 'messages'), messageData);
    console.log("storing firebase message as ", messageData);
    // Update chat's updatedAt timestamp
    await updateDoc(doc(db, 'chats', chatId), {
      updatedAt: new Date().toISOString()
    });
    
    return {
      id: messageRef.id,
      ...messageData
    };
  } catch (error) {
    console.error('Error adding message:', error);
    return null;
  }
};

export const deleteChat = async (chatId: string): Promise<boolean> => {
  try {
    // Delete all messages in the chat
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId)
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    const deletePromises = messagesSnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    
    // Delete the chat document
    await deleteDoc(doc(db, 'chats', chatId));
    
    return true;
  } catch (error) {
    console.error('Error deleting chat:', error);
    return false;
  }
};

export const updateChatAgent = async (chatId: string, agent: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'chats', chatId), {
      agent: agent,
      updatedAt: new Date().toISOString()
    });
    console.log(`Updated chat ${chatId} agent to: ${agent}`);
    return true;
  } catch (error) {
    console.error('Error updating chat agent:', error);
    return false;
  }
};

export const updateChatTitle = async (chatId: string, newTitle: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'chats', chatId), {
      title: newTitle
    });
    
    return true;
  } catch (error) {
    console.error('Error updating chat title:', error);
    return false;
  }
};

interface AddParticipantOptions {
  chatId: string;
  participant: ChatParticipant;
  requesterId: string;
}

export const addChatParticipant = async ({
  chatId,
  participant,
  requesterId,
}: AddParticipantOptions): Promise<{ status: 'added' | 'exists' }> => {
  const chatRef = doc(db, 'chats', chatId);

  const participantWithMeta: ChatParticipant = {
    ...participant,
    joinedAt: participant.joinedAt || new Date().toISOString(),
  };

  const systemMessage = {
    chatId,
    content: `${participant.displayName} just joined the chat.`,
    role: 'system' as const,
    senderType: 'system' as const,
    createdAt: new Date().toISOString(),
  };

  return runTransaction(db, async (transaction) => {
    const chatSnap = await transaction.get(chatRef);

    if (!chatSnap.exists()) {
      throw new Error('Chat not found');
    }

    const chatData = chatSnap.data() as Chat;
    const existingParticipants = chatData.participants || [];
    const participantIds = chatData.participantIds || buildParticipantIds(existingParticipants);

    const requesterIsParticipant = existingParticipants.some((p) => p.uid === requesterId);
    if (!requesterIsParticipant) {
      throw new Error('Only chat participants can add new members');
    }

    const alreadyExists = existingParticipants.some((p) => p.uid === participantWithMeta.uid);
    if (alreadyExists) {
      return { status: 'exists' as const };
    }

    const updatedParticipants = [...existingParticipants, participantWithMeta];
    const updatedParticipantIds = Array.from(new Set([...participantIds, participantWithMeta.uid]));
    const existingAgents = (chatData as any).agents || [];
    const updatedAgents =
      participantWithMeta.type === 'agent'
        ? Array.from(new Set([...existingAgents, participantWithMeta.uid]))
        : existingAgents;

    const newMessageRef = doc(collection(db, 'messages'));

    transaction.update(chatRef, {
      participants: updatedParticipants,
      participantIds: updatedParticipantIds,
      updatedAt: new Date().toISOString(),
      ...(participantWithMeta.type === 'agent'
        ? { agents: updatedAgents }
        : existingAgents.length
        ? { agents: existingAgents }
        : {})
    });

    transaction.set(newMessageRef, systemMessage);

    return { status: 'added' as const };
  });
};