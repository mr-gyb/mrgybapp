import { collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Chat, Message } from '../../types/chat';

export const createChat = async (userId: string, title: string = 'New Chat'): Promise<Chat | null> => {
  try {
    const chatData = {
      title,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const chatRef = await addDoc(collection(db, 'chats'), chatData);
    
    return {
      id: chatRef.id,
      title,
      userId,
      createdAt: chatData.createdAt,
      updatedAt: chatData.updatedAt,
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
  aiAgent?: string
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