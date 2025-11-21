import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Chat, ChatParticipant, Message, OpenAIMessage } from '../types/chat';
import { generateAIResponse, generateAIResponse2, ChatDiagnostics } from '../api/services/chat.service';
import { ChatCompletionContentPart } from "openai/resources/chat/completions";
import { getAuth } from "firebase/auth"; // for firebase auth ID token
import { addChatParticipant as addParticipantApi, updateChatAgent } from '../lib/firebase/chats';
import { AI_USERS } from '../types/user';

const logTelemetryEvent = (eventName: string, payload: Record<string, unknown>) => {
  console.log(`[telemetry] ${eventName}`, payload);
};


interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  selectedAgent: string | null;
  isLoading: boolean;
  error: string | null;
  isProcessingAI: boolean;
  setIsProcessingAI: React.Dispatch<React.SetStateAction<boolean>>;
  newchatButton: () => Promise<string | null>;
  createNewChat: () => Promise<string | null>;
  addMessage: (chatId: string, content: string | OpenAIMessage, role: 'user' | 'assistant' | 'system', senderId?: string, aiAgent?: string | null) => Promise<void>;
  addImage: (chatId: string, content: ChatCompletionContentPart[], role: 'user' | 'assistant' | 'system', senderId?: string, aiAgent?: string | null) => Promise<void>;
  setCurrentChat: (chatId: string) => void;
  setSelectedAgent: (agent: string | null) => void;
  deleteChat: (chatId: string) => Promise<boolean>;
  updateChatTitle: (chatId: string, newTitle: string) => Promise<boolean>;
  updateChatAgentField: (chatId: string, agent: string) => Promise<boolean>;
  uploadFileToOpenAI: (chatId: string, file: File) => Promise<void>;
  addParticipant: (chatId: string, participant: ChatParticipant) => Promise<'added' | 'exists'>;
  chatDiagnostics: ChatDiagnostics | null;
  clearChatDiagnostics: () => void;
  streamingResponses: Record<string, { content: string; agent: string | null }>;
  retryableChats: Record<string, { prompt: string; agent: string | null; status?: number; message?: string; requestId?: string; retryAfter?: number }>;
  retryLastPrompt: (chatId: string) => Promise<void>;
  quotaError: { retryAfter?: number; message: string } | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  // Default fallback to Chris as requested
  const [selectedAgent, setSelectedAgent] = useState<string | null>('Chris');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [chatDiagnostics, setChatDiagnostics] = useState<ChatDiagnostics | null>(null);
  const [streamingResponses, setStreamingResponses] = useState<Record<string, { content: string; agent: string | null }>>({});
  const [retryableChats, setRetryableChats] = useState<Record<string, { prompt: string; agent: string | null; status?: number; message?: string; requestId?: string; retryAfter?: number }>>({});
  const [quotaError, setQuotaError] = useState<{ retryAfter?: number; message: string } | null>(null);
  const { user, userData } = useAuth();

  const buildOwnerParticipant = (): ChatParticipant | null => {
    if (!user) return null;
    return {
      uid: user.uid,
      type: 'user',
      displayName: userData?.name || user.displayName || user.email || 'You',
      photoURL: userData?.profile_image_url || user.photoURL || undefined,
      joinedAt: new Date().toISOString(),
    };
  };

  const buildAgentParticipant = (agentLabel: string | null): ChatParticipant | null => {
    if (!agentLabel) return null;
    const normalizedLabel = agentLabel.trim().toLowerCase();
    const agentProfile = Object.values(AI_USERS).find(
      (agent) =>
        agent.name.toLowerCase() === normalizedLabel ||
        agent.id.toLowerCase() === normalizedLabel ||
        agent.username.toLowerCase() === normalizedLabel.replace(/\s+/g, '_')
    );

    if (!agentProfile) return null;

    return {
      uid: agentProfile.id,
      type: 'agent',
      displayName: agentProfile.name,
      photoURL: agentProfile.profile_image_url,
      joinedAt: new Date().toISOString(),
    };
  };

  const beginStreamingResponse = (chatId: string, agent: string | null) => {
    setStreamingResponses(prev => ({
      ...prev,
      [chatId]: {
        content: '',
        agent,
      },
    }));
  };

  const appendStreamingResponse = (chatId: string, token: string) => {
    setStreamingResponses(prev => {
      const existing = prev[chatId];
      if (!existing) {
        return prev;
      }
      return {
        ...prev,
        [chatId]: {
          ...existing,
          content: `${existing.content}${token}`,
        },
      };
    });
  };

  const endStreamingResponse = (chatId: string) => {
    setStreamingResponses(prev => {
      if (!(chatId in prev)) {
        return prev;
      }
      const { [chatId]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const migrateLegacyChats = async (uid: string) => {
    const legacyQuery = query(collection(db, 'chats'), where('userId', '==', uid));
    const snapshot = await getDocs(legacyQuery);

    const ownerParticipant = buildOwnerParticipant();

    for (const chatDoc of snapshot.docs) {
      const data = chatDoc.data();
      if (data.participantIds && Array.isArray(data.participantIds)) {
        continue;
      }

      const participants: ChatParticipant[] = [];
      if (ownerParticipant) {
        participants.push({ ...ownerParticipant, joinedAt: data.createdAt || new Date().toISOString() });
      }

      const agentParticipant = buildAgentParticipant(data.AIAgent || data.agent);
      if (agentParticipant) {
        participants.push(agentParticipant);
      }

      await updateDoc(chatDoc.ref, {
        participants,
        participantIds: participants.map((p) => p.uid),
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    let unsubscribeChats = () => {};
    let unsubscribeMessages: { [key: string]: () => void } = {};
    let isSubscribed = true; // Add cleanup flag
    
    const setupSubscriptions = async () => {
      setIsLoading(true);
      
      if (!user || !user.uid)  {
        setChats([]);
        setCurrentChatId(null);
        setIsLoading(false);
        return;
      }

      try {
        await migrateLegacyChats(user.uid);

        // Subscribe to chats
        const chatsQuery = query(
          collection(db, 'chats'),
          where('participantIds', 'array-contains', user.uid),
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
            
            try {
              const chatId = chatDoc.id;
              const chatDocData = chatDoc.data();
              
              // Validate chat data
              if (!chatDocData || !chatDocData.title || !chatDocData.participants) {
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
                participants: chatDocData.participants || [],
                agents: chatDocData.agents || [],
                participantIds: chatDocData.participantIds || [],
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
      const ownerParticipant = buildOwnerParticipant();
      const agentParticipant = buildAgentParticipant(selectedAgent);

      const participants: ChatParticipant[] = [
        ...(ownerParticipant ? [ownerParticipant] : []),
        ...(agentParticipant ? [agentParticipant] : []),
      ];

      const newChat = {
        title: 'New Chat',
        userId: user.uid,
        AIAgent: selectedAgent,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        participants,
        participantIds: participants.map((p) => p.uid),
        agents: agentParticipant ? [agentParticipant.uid] : [],
      };
      
      const chatRef = await addDoc(collection(db, 'chats'), newChat);
      const newChatWithId: Chat = {
        id: chatRef.id,
        ...newChat,
        participants,
        agents: newChat.agents,
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

  const requestAIResponse = async (
    chatId: string,
    agent: string | null,
    prompt: string,
    overrideHistory?: OpenAIMessage[]
  ) => {
    if (isProcessingAI) {
      return;
    }

    const agentName = agent || selectedAgent || 'Chris';
    const metadata = {
      chatId,
      userId: user?.uid,
    };

    setError(null);
    setChatDiagnostics(null);
    beginStreamingResponse(chatId, agentName);
    setIsProcessingAI(true);

    try {
      const currentChat = chats.find(c => c.id === chatId);
      const historyForAI =
        overrideHistory ||
        (currentChat?.messages || []).map(m => ({
          role: m.role,
          content: m.content,
        }));

      const aiResult = await generateAIResponse(historyForAI, agentName, {
        onToken: token => appendStreamingResponse(chatId, token),
        metadata,
      });

      setChatDiagnostics(aiResult.diagnostics ?? null);
      endStreamingResponse(chatId);

      if (aiResult.content && !aiResult.isFallback) {
        const aiMessageData = {
          chatId,
          senderId: null,
          aiAgent: agentName,
          content: aiResult.content,
          role: 'assistant' as const,
          senderType: 'agent' as const,
          createdAt: new Date().toISOString(),
        };

        await addDoc(collection(db, 'messages'), aiMessageData);
        await updateDoc(doc(db, 'chats', chatId), {
          updatedAt: new Date().toISOString(),
        });

        logTelemetryEvent('agent_reply', {
          chatId,
          agentId: agentName,
          requestId: aiResult.requestId,
        });
      }

      if (aiResult.isFallback) {
        // Check if this is a quota error (billing issue) or rate limit (temporary)
        const errorType = (aiResult.diagnostics?.meta as any)?.errorType;
        const isQuotaError = 
          aiResult.diagnostics?.code === 'insufficient_quota' ||
          errorType === 'quota' ||
          (aiResult.errorMessage?.toLowerCase().includes('quota') && 
           (aiResult.errorMessage?.toLowerCase().includes('exceeded') || 
            aiResult.errorMessage?.toLowerCase().includes('billing')));
        
        const isRateLimit = 
          (aiResult.errorStatus === 429 && !isQuotaError) ||
          errorType === 'rate_limit' ||
          aiResult.diagnostics?.code === 'rate_limit_exceeded';
        
        // Get the exact error message from diagnostics or errorMessage
        const exactErrorMessage = 
          aiResult.errorMessage || 
          aiResult.content || 
          (aiResult.diagnostics?.meta as any)?.message ||
          (aiResult.diagnostics?.detail as string) ||
          'An error occurred';
        
        if (isQuotaError) {
          // Quota exceeded = billing issue, no retry-after
          // Use the exact error message from OpenAI/backend
          setQuotaError({
            retryAfter: undefined, // Quota errors don't have retry-after
            message: exactErrorMessage, // Use exact error message
          });
          
          // Don't auto-clear quota errors - user needs to fix billing
        } else if (isRateLimit) {
          // Rate limit = temporary, can retry
          const retryAfter = (aiResult.diagnostics?.meta as any)?.retryAfter;
          // Use the exact error message, add retry info if available
          const rateLimitMessage = retryAfter
            ? `${exactErrorMessage} Please wait ${retryAfter} seconds before trying again.`
            : exactErrorMessage;
          
          setQuotaError({
            retryAfter,
            message: rateLimitMessage,
          });
          
          // Auto-clear rate limit error after retryAfter seconds (or 60s default)
          const clearDelay = (retryAfter || 60) * 1000;
          setTimeout(() => {
            setQuotaError(null);
          }, clearDelay);
        } else {
          // For other errors, still show the exact error message
          setQuotaError({
            retryAfter: undefined,
            message: exactErrorMessage,
          });
          
          // Auto-clear after 30 seconds for non-quota/rate-limit errors
          setTimeout(() => {
            setQuotaError(null);
          }, 30000);
        }
        
        setError(aiResult.content);
        setRetryableChats(prev => ({
          ...prev,
          [chatId]: {
            prompt,
            agent: agentName,
            status: aiResult.errorStatus,
            message: aiResult.errorMessage || aiResult.content,
            requestId: aiResult.requestId,
            retryAfter: isQuotaError ? (aiResult.diagnostics?.meta as any)?.retryAfter : undefined,
          },
        }));
        return;
      }
      
      // Clear quota error on success
      setQuotaError(null);

      setRetryableChats(prev => {
        const { [chatId]: _removed, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      endStreamingResponse(chatId);
      // Extract exact error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isQuotaError = errorMessage.toLowerCase().includes('quota') || 
                          errorMessage.toLowerCase().includes('billing');
      
      // Log quota errors as warnings (they're expected and handled in UI)
      if (isQuotaError) {
        console.warn('[chat] quota error in requestAIResponse:', errorMessage);
      } else {
        console.error('[chat] error in requestAIResponse:', errorMessage, error);
      }
      
      // Use the exact error message instead of generic fallback
      setError(errorMessage);
      setChatDiagnostics({
        code: 'client_failure',
        source: 'client',
        detail: errorMessage, // Use exact error message
      });
      setRetryableChats(prev => ({
        ...prev,
        [chatId]: {
          prompt,
          agent: agent || selectedAgent || 'Chris',
          message: detail,
        },
      }));
    } finally {
      setIsProcessingAI(false);
    }
  };

  const addMessage = async (chatId: string,   content: string | OpenAIMessage,   role: 'user' | 'assistant' | 'system',   senderId?: string,    aiAgent?: string) => {
    try {
      const messageContent = typeof content === 'string' ? content : JSON.stringify(content);
      console.log("add message aiagent is ", aiAgent);

      const senderType =
        role === 'system'
          ? 'system'
          : role === 'assistant'
          ? 'agent'
          : 'user';
  
      const newMessage = {
        chatId,
        senderId: senderId || null,
        aiAgent: aiAgent || null,
        content: messageContent,
        role,
        senderType,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'messages'), newMessage);
      
      // Update chat's updatedAt timestamp
      await updateDoc(doc(db, 'chats', chatId), {
        updatedAt: new Date().toISOString()
      });

      // If it's a user message, stream AI response
      if (role === 'user') {
        setRetryableChats(prev => {
          const { [chatId]: _removed, ...rest } = prev;
          return rest;
        });

          const currentChat = chats.find(c => c.id === chatId);
        const historyForAI: OpenAIMessage[] = [
          ...((currentChat?.messages || []).map(m => ({
              role: m.role,
            content: m.content,
          })) as OpenAIMessage[]),
          {
            role: 'user',
            content: messageContent,
          },
        ];
              
        await requestAIResponse(chatId, aiAgent || selectedAgent, messageContent, historyForAI);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      setChatDiagnostics({
        code: 'client_failure',
        source: 'client',
        detail: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const addParticipant = async (chatId: string, participant: ChatParticipant): Promise<'added' | 'exists'> => {
    if (!user) {
      throw new Error('You must be signed in to add participants.');
    }

    try {
      const result = await addParticipantApi({
        chatId,
        participant,
        requesterId: user.uid,
      });

      if (result.status === 'added') {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id !== chatId) return chat;

            const existingParticipants = chat.participants || [];
            const alreadyExists = existingParticipants.some((p) => p.uid === participant.uid);
            if (alreadyExists) return chat;

            const updatedParticipants = [...existingParticipants, participant];
            const updatedParticipantIds = Array.from(
              new Set([...(chat.participantIds || []), participant.uid])
            );
            const updatedAgents =
              participant.type === 'agent'
                ? Array.from(new Set([...(chat.agents || []), participant.uid]))
                : chat.agents;

            return {
              ...chat,
              participants: updatedParticipants,
              participantIds: updatedParticipantIds,
              agents: updatedAgents,
            };
          })
        );

        logTelemetryEvent('chat_participant_added', {
          chatId,
          participantId: participant.uid,
          type: participant.type,
          source: 'popover',
        });

        if (participant.type === 'agent') {
          logTelemetryEvent('agent_invoked', {
            chatId,
            agentId: participant.uid,
            source: 'popover',
          });
        }
      }

      return result.status;
    } catch (error) {
      console.error('Failed to add participant:', error);
      throw error;
    }
  };

  const retryLastPrompt = async (chatId: string) => {
    const retryData = retryableChats[chatId];
    if (!retryData) {
      console.warn('No retry data available for chat', chatId);
      return;
    }

    await requestAIResponse(
      chatId,
      retryData.agent || selectedAgent,
      retryData.prompt
    );
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
        senderType: role === 'assistant' ? 'agent' : role === 'system' ? 'system' : 'user',
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

        const aiResponse = await generateAIResponse2(content, aiAgent || 'Chris');

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

  const updateChatAgentField = async (chatId: string, agent: string): Promise<boolean> => {
    try {
      const success = await updateChatAgent(chatId, agent);
      if (success) {
        console.log(`Successfully updated chat ${chatId} agent to: ${agent}`);
      }
      return success;
    } catch (error) {
      console.error('Error updating chat agent:', error);
      setError('Failed to update chat agent');
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

  const clearChatDiagnostics = () => setChatDiagnostics(null);

  const value = {
    chats,
    currentChatId,
    selectedAgent,
    isLoading,
    error,
    isProcessingAI,
    setIsProcessingAI,
    newchatButton,
    createNewChat,
    addMessage,
    addImage,
    setCurrentChat: setCurrentChatId,
    setSelectedAgent,
    deleteChat,
    updateChatTitle,
    updateChatAgentField,
    uploadFileToOpenAI,
    addParticipant,
    chatDiagnostics,
    clearChatDiagnostics,
    streamingResponses,
    retryableChats,
    retryLastPrompt,
    quotaError,
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