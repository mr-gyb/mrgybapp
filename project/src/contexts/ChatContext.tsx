import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Chat, Message, OpenAIMessage } from '../types/chat';
import { generateAIResponse, generateAIResponse2 } from '../api/services/chat.service';
import { ChatCompletionContentPart } from "openai/resources/chat/completions";
import { getAuth } from "firebase/auth"; // for firebase auth ID token


interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  selectedAgent: string | null;
  isLoading: boolean;
  error: string | null;
  isProcessingAI: boolean;
  newchatButton: () => Promise<string | null>;
  createNewChat: () => Promise<string | null>;
  addMessage: (chatId: string, content: string | OpenAIMessage, role: 'user' | 'assistant' | 'system', senderId?: string, aiAgent?: string | null) => Promise<void>;
  addImage: (chatId: string, content: ChatCompletionContentPart[], role: 'user' | 'assistant' | 'system', senderId?: string, aiAgent?: string | null) => Promise<void>;
  setCurrentChat: (chatId: string) => void;
  setSelectedAgent: (agent: string | null) => void;
  deleteChat: (chatId: string) => Promise<boolean>;
  updateChatTitle: (chatId: string, newTitle: string) => Promise<boolean>;
  uploadFileToOpenAI: (chatId: string, file: File) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribeChats = () => {};
    let unsubscribeMessages: { [key: string]: () => void } = {};
    let isSubscribed = true; // Add cleanup flag
    
    const setupSubscriptions = async () => {
      setIsLoading(true);
      
      if (!user)  {
        setChats([]);
        setCurrentChatId(null);
        setIsLoading(false);
        return;
      }

      try {
        // Subscribe to chats
        const chatsQuery = query(
          collection(db, 'chats'),
          where('userId', '==', user.uid),
          orderBy('updatedAt', 'desc')
        );
        
        unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
          if (!isSubscribed) return; // Check if still subscribed
          
          // Initialize chatData as an empty array
          const chatData: Chat[] = [];
          
          // Unsubscribe from old message listeners
          Object.values(unsubscribeMessages).forEach(unsubscribe => unsubscribe());
          unsubscribeMessages = {};
          
          // Process each chat document
          snapshot.docs.forEach(chatDoc => {
            if (!isSubscribed) return; // Check if still subscribed
            
            // Skip any documents that don't look like chat documents
            if (!chatDoc || !chatDoc.data || typeof chatDoc.data !== 'function') {
              console.warn('Invalid chat document encountered:', chatDoc);
              return;
            }
            
            try {
              const chatId = chatDoc.id;
              const chatDocData = chatDoc.data();
              
              // Validate chat data
              if (!chatDocData || !chatDocData.title || !chatDocData.userId) {
                console.warn('Invalid chat data for document:', chatId);
                return;
              }
              
              // Subscribe to messages for this chat (add)
                const messagesQuery = query(
                  collection(db, 'messages'),
                  where('chatId', '==', chatId),
                  orderBy('createdAt', 'asc')
                );
                
              unsubscribeMessages[chatId] = onSnapshot(messagesQuery, (messagesSnapshot) => {
                if (!isSubscribed) return; // Check if still subscribed
                
                const messages = messagesSnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                })) as Message[];

                // update the state with message in the specific chat.
                setChats(prevChats => 
                  prevChats.map(chat => 
                    chat.id === chatId
                      ? { ...chat, messages }
                      : chat
                  )
                );
              });
              
              // Add this chat to our array
              chatData.push({
                id: chatId,
                title: chatDocData.title,
                userId: chatDocData.userId,
                createdAt: chatDocData.createdAt,
                updatedAt: chatDocData.updatedAt,
                messages: []
              });
            } catch (err) {
              console.error('Error processing chat document:', err);
            }
          });
          
          if (!isSubscribed) return;
          
          setChats(prevChats => {
            const chatMap = new Map(prevChats.map(chat => [chat.id, chat]));

            for (const newChat of chatData) {
              const existingChat = chatMap.get(newChat.id);
              if (existingChat) {
                chatMap.set(newChat.id, {
                  ...existingChat,
                  ...newChat,
                  messages: existingChat.messages // 
                });
              } else {
                chatMap.set(newChat.id, newChat);
              }
            }

            return Array.from(chatMap.values());
          })
          
          // Set currentChatId to the latest chat if it's not already set
          if (chatData.length > 0 && !currentChatId) {
            setCurrentChatId(chatData[0].id);
          }
          
          setIsLoading(false);
        });
      } catch (err) {
        console.error('Error setting up chat subscriptions:', err);
        setError('Failed to load chats');
        setIsLoading(false);
      }
    };

    setupSubscriptions();
    
    return () => {
      isSubscribed = false; // Set cleanup flag
      unsubscribeChats();
      Object.values(unsubscribeMessages).forEach(unsubscribe => unsubscribe());
    };
  }, [user, currentChatId]);

  const newchatButton = async () => {
    console.log("user", user);
    if(!user) return null;

    try{
      // console.log("newchatButton");
      const newChatId = await createNewChat();
      if (newChatId && selectedAgent) {
        const initialMessage = `Hello! I'm ${selectedAgent}. How can I help you today?`;
        await addMessage(newChatId, initialMessage, 'assistant', undefined, selectedAgent);
      }
      return newChatId;
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Failed to create new chat');
      return null;
    }
  };

  const createNewChat = async () => {
    if (!user) return null;

    try {
      const newChat = {
        title: 'New Chat',
        userId: user.uid,
        AIAgent: selectedAgent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const chatRef = await addDoc(collection(db, 'chats'), newChat);
      const newChatWithId: Chat = {
        id: chatRef.id,
        ...newChat,
        messages: []
      };
      
      setChats(prev => [newChatWithId, ...prev]);
      setCurrentChatId(chatRef.id);
      return chatRef.id;
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Failed to create new chat');
      return null;
    }
  };

  const addMessage = async (chatId: string,   content: string | OpenAIMessage,   role: 'user' | 'assistant' | 'system',   senderId?: string,    aiAgent?: string) => {
    try {
      const messageContent = typeof content === 'string' ? content : JSON.stringify(content);
      console.log("add message aiagent is ", aiAgent);

  
      const newMessage = {
        chatId,
        senderId: senderId || null,
        aiAgent: aiAgent || null,
        content: messageContent,
        role,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'messages'), newMessage);
      
      // Update chat's updatedAt timestamp
      await updateDoc(doc(db, 'chats', chatId), {
        updatedAt: new Date().toISOString()
      });

      // If it's a user message, get AI response
      if (role === 'user' && !isProcessingAI) {
        setIsProcessingAI(true);
        try {
          const currentChat = chats.find(c => c.id === chatId);
          if (currentChat) {
             //Convert chat history to OpenAI format
            const messages: OpenAIMessage[] = (currentChat.messages || []).map(m => ({
              role: m.role,
              content: m.content
            }));

            // Add the new user message to the messages array
            const aiResponse = await generateAIResponse([...messages, { content: messageContent }], aiAgent || 'Mr.GYB AI');
            
            if (aiResponse) {
              // Add the AI response as a new message
              const aiMessageData = {
                chatId,
                senderId: null,
                aiAgent: aiAgent || null,
                content: aiResponse,
                role: 'assistant' as const,
                createdAt: new Date().toISOString()
              };
              
              await addDoc(collection(db, 'messages'), aiMessageData);
              
              // Update chat's updatedAt timestamp again
              await updateDoc(doc(db, 'chats', chatId), {
                updatedAt: new Date().toISOString()
              });
            }
          }
        } catch (error) {
          console.error('Failed to get AI response:', error);
          setError('Failed to get AI response');
        } finally {
          setIsProcessingAI(false);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      setIsProcessingAI(false);
    }
  };
  const addImage = async (chatId: string,   content: ChatCompletionContentPart[],   role: 'user' | 'assistant' | 'system',   senderId?: string,    aiAgent?: string) => {
    try {
      // DEBUG: console.log("coming well");
      // To convert the content so that I can store to firebase and then render in the local page
      const messageContent = JSON.stringify({content: content });

      const newMessage = {
        chatId,
        senderId: senderId || null,
        aiAgent: aiAgent || null,
        content: messageContent,
        role,
        createdAt: new Date().toISOString()
      };

      // Storing Firebase
      await addDoc(collection(db, 'messages'), newMessage);
      await updateDoc(doc(db, 'chats', chatId), {
        updatedAt: new Date().toISOString()
      });

      // OpenAI vision response
      if(!isProcessingAI){
        setIsProcessingAI(true);

        const aiResponse = await generateAIResponse2(content, aiAgent || 'Mr.GYB AI');

        if (aiResponse) {
          // Add the AI response as a new message
          const aiMessageData = {
            chatId,
            senderId: null,
            aiAgent: aiAgent || null,
            content: aiResponse,
            role: 'assistant' as const,
            createdAt: new Date().toISOString()
          };
          
          await addDoc(collection(db, 'messages'), aiMessageData);
          
          // Update chat's updatedAt timestamp again
          await updateDoc(doc(db, 'chats', chatId), {
            updatedAt: new Date().toISOString()
          });
        }
      }
      

    } catch(err){
      console.error('Error sending image:', err);
      setError('Failed to send message');
      setIsProcessingAI(false);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const deleteChat = async (chatId: string) => {
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
      
      // Update local state
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (currentChatId === chatId) {
        setCurrentChatId(null);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError('Failed to delete chat');
      return false;
    }
  };

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    try {
      await updateDoc(doc(db, 'chats', chatId), {
        title: newTitle,
        updatedAt: new Date().toISOString()
      });
      
      setChats(prev =>
        prev.map(chat =>
          chat.id === chatId
            ? { ...chat, title: newTitle }
            : chat
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating chat title:', err);
      setError('Failed to update chat title');
      return false;
    }
  };

  const uploadFileToOpenAI = async (chatId: string, file: File) => {
    try{
      const idToken = await user?.getIdToken();
      // debug for id token
      console.log("idtoken : ",idToken);

      const formData = new FormData();
      formData.append('file', file);
      console.log("The file is :", file);
    
      const response = await fetch("https://us-central1-mr-gyb-ai-app-108.cloudfunctions.net/uploadDocumentToOpenAI", {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}` // adding authentication
        },
        body: formData as any,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json(); // result.fileId, result.fileName

      // storing the meta message
      const newMessage = {
        chatId,
        senderId: user?.uid || null,
        content: `Uploaded file to OpenAI: ${result.fileName} (ID: ${result.fileId})`,
        role: "user" as const,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'messages'), newMessage);
      await updateDoc(doc(db, 'chats', chatId), {
        updatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error("Failed to upload file:", error);
      setError("Failed to upload file");
    }
  };

  const value = {
    chats,
    currentChatId,
    selectedAgent,
    isLoading,
    error,
    isProcessingAI,
    newchatButton,
    createNewChat,
    addMessage,
    addImage,
    setCurrentChat: setCurrentChatId,
    setSelectedAgent,
    deleteChat,
    updateChatTitle,
    uploadFileToOpenAI
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};