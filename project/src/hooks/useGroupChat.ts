import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  GroupChat,
  GroupChatMessage,
  SenderType,
} from '../types/groupChat';
import {
  createGroupChat,
  getUserGroupChats,
  getGroupChat,
  sendGroupMessage,
  subscribeToGroupMessages,
  subscribeToUserGroupChats,
  addParticipantToGroup,
} from '../services/groupChat.service';
import { CreateGroupChatInput } from '../types/groupChat';

// Track if we've logged the AI disabled warning (suppress spam)
let aiDisabledWarningLogged = false;

/**
 * Get AI API endpoint URL - ENV ONLY, NO localhost fallback
 * 
 * Resolution logic:
 * 1. import.meta.env.VITE_AI_API_URL
 * 2. process.env.REACT_APP_AI_API_URL
 * 3. null (AI disabled)
 * 
 * Returns null if no ENV is configured - AI will be safely disabled
 */
const getBackendUrl = (): string | null => {
  // Only use ENV variables - no localhost fallback
  const AI_URL = 
    import.meta.env.VITE_AI_API_URL ||
    process.env.REACT_APP_AI_API_URL ||
    null;

  if (AI_URL && AI_URL.trim()) {
    const url = AI_URL.replace(/\/$/, ''); // Remove trailing slash
    console.log('✅ Using AI Endpoint: ' + url);
    return url;
  }
  
  // No AI endpoint configured - log warning once per session
  if (!aiDisabledWarningLogged) {
    console.warn('⚠️ AI disabled — No API URL configured');
    console.warn('   To enable AI, set one of these environment variables:');
    console.warn('   - VITE_AI_API_URL (recommended)');
    console.warn('   - REACT_APP_AI_API_URL');
    console.warn('');
    console.warn('   Example: VITE_AI_API_URL=https://api.yourdomain.com');
    console.warn('   Or add to .env file: VITE_AI_API_URL=https://api.yourdomain.com');
    console.warn('');
    console.warn('   Group chat will work normally without AI.');
    console.warn('');
    console.warn('   🔄 RESTART REQUIRED: After setting VITE_AI_API_URL, restart the dev server:');
    console.warn('   1. Stop the server (Ctrl+C)');
    console.warn('   2. Run: npm run dev');
    aiDisabledWarningLogged = true;
  }
  
  return null; // AI disabled - no endpoint available
};

interface UseGroupChatReturn {
  // State
  groupChats: GroupChat[];
  activeGroupChat: GroupChat | null;
  messages: GroupChatMessage[];
  isLoading: boolean;
  error: string | null;

  // Actions
  createGroup: (input: CreateGroupChatInput) => Promise<GroupChat | null>;
  selectGroupChat: (groupId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  refreshGroupChats: () => Promise<void>;
}

export function useGroupChat(): UseGroupChatReturn {
  const { user } = useAuth();
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [activeGroupChat, setActiveGroupChat] = useState<GroupChat | null>(null);
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for subscriptions
  const messagesUnsubscribeRef = useRef<(() => void) | null>(null);
  const groupChatsUnsubscribeRef = useRef<(() => void) | null>(null);
  const activeGroupIdRef = useRef<string | null>(null);

  // Get AI agent ID from active group chat
  const getActiveAgentId = useCallback((): string | null => {
    if (!activeGroupChat) return null;
    const aiParticipant = activeGroupChat.participants.find((p) => p.type === 'ai');
    return aiParticipant?.id || null;
  }, [activeGroupChat]);

  // Trigger AI response when a human sends a message
  const triggerAIResponse = useCallback(
    async (humanMessage: string, agentId: string) => {
      try {
        if (!activeGroupChat) return;

        // Get conversation history for context
        const conversationHistory = messages
          .slice(-10) // Last 10 messages for context
          .map((msg) => ({
            role: msg.senderType === 'ai' ? 'assistant' : 'user',
            content: msg.content,
          }));

        // Get backend URL - ENV ONLY, no localhost fallback
        const backendUrl = getBackendUrl();
        
        // If no backend URL configured, skip AI gracefully
        // Warning already logged in getBackendUrl() - don't duplicate
        // Do NOT call fetch if AI is disabled - exit early
        if (!backendUrl) {
          return; // AI disabled - skip fetch, don't block chat
        }
        
        const apiUrl = `${backendUrl}/api/chat/non-streaming`;
        
        let response: Response;
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [
                ...conversationHistory,
                { role: 'user', content: humanMessage },
              ],
              agent: agentId, // Pass agent ID to use correct system prompt
            }),
          });
        } catch (fetchError: any) {
          // Network error or unreachable endpoint - don't crash, just skip AI
          console.warn('⚠️ AI Server Offline — Skipping AI Response', {
            url: apiUrl,
            error: fetchError.message || 'Network error',
          });
          return; // Gracefully skip AI response - chat continues normally
        }

        // Handle 404 or other errors gracefully - never throw
        if (response.status === 404) {
          console.warn('⚠️ AI endpoint not found (404) — Skipping AI Response', {
            url: apiUrl,
            status: response.status,
          });
          return; // Gracefully skip AI response - chat continues normally
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.warn('⚠️ AI response error — Skipping AI Response', {
            status: response.status,
            statusText: response.statusText,
            url: apiUrl,
            errorText: errorText.substring(0, 200),
          });
          return; // Gracefully skip AI response - never throw, chat continues normally
        }

        const data = await response.json().catch(() => ({}));
        const aiResponse = data.response || data.message || 'I apologize, but I could not generate a response.';

        // Send AI response as a message in the group chat
        // Wrap in try-catch to ensure AI message sending errors don't propagate
        try {
          await sendGroupMessage(
            activeGroupChat.id,
            agentId,
            'ai',
            aiResponse
          );
        } catch (sendError) {
          // If sending AI message fails, log but don't throw
          console.warn('⚠️ Failed to send AI response message:', sendError);
          // Don't throw - human message was already sent successfully
        }
      } catch (error: any) {
        // Catch-all for any unexpected errors - never crash the app
        console.warn('⚠️ Error triggering AI response — Skipping AI Response', {
          error: error.message || String(error),
        });
        // Don't show error to user - AI response is optional and group chat must continue working
        // Human messages are already sent successfully, AI failure doesn't affect them
        return; // Explicitly return to ensure no further execution
      }
    },
    [activeGroupChat, messages]
  );

  // Create a new group chat
  const createGroup = useCallback(
    async (input: CreateGroupChatInput): Promise<GroupChat | null> => {
      if (!user?.uid) {
        setError('You must be logged in to create a group chat');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('Creating group chat with input:', { ...input, userId: user.uid });
        
        const groupChat = await createGroupChat({
          ...input,
          userId: user.uid,
        });

        console.log('Group chat created:', groupChat);

        if (!groupChat) {
          throw new Error('Group chat creation returned null - check Firestore permissions and console for details');
        }

        // Refresh group chats list first
        await refreshGroupChats();
        // Select the new group chat after a short delay to ensure it's in the list
        setTimeout(async () => {
          try {
            await selectGroupChat(groupChat.id);
          } catch (selectError) {
            console.error('Error selecting new group chat:', selectError);
            // Group was created, just refresh the list
            await refreshGroupChats();
          }
        }, 500);

        return groupChat;
      } catch (err: any) {
        console.error('Error in createGroupChat hook:', err);
        const errorMessage = err?.message || err?.toString() || 'Failed to create group chat';
        
        // Provide more helpful error messages
        let userFriendlyMessage = errorMessage;
        if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
          userFriendlyMessage = 'Permission denied. Please make sure Firestore rules are deployed: firebase deploy --only firestore:rules';
        } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
          userFriendlyMessage = 'Network error. Please check your internet connection.';
        } else if (errorMessage.includes('auth')) {
          userFriendlyMessage = 'Authentication error. Please log out and log back in.';
        }
        
        setError(userFriendlyMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.uid]
  );

  // Select a group chat
  const selectGroupChat = useCallback(
    async (groupId: string) => {
      if (activeGroupIdRef.current === groupId) {
        return; // Already selected
      }

      setIsLoading(true);
      setError(null);

      try {
        // Unsubscribe from previous messages
        if (messagesUnsubscribeRef.current) {
          messagesUnsubscribeRef.current();
          messagesUnsubscribeRef.current = null;
        }

        // Get group chat details
        const groupChat = await getGroupChat(groupId);
        if (!groupChat) {
          throw new Error('Group chat not found');
        }

        setActiveGroupChat(groupChat);
        activeGroupIdRef.current = groupId;

        // Subscribe to real-time messages
        const unsubscribe = subscribeToGroupMessages(groupId, (newMessages) => {
          setMessages(newMessages);
        });

        messagesUnsubscribeRef.current = unsubscribe;

        // Load initial messages
        const initialMessages = await getGroupMessages(groupId);
        setMessages(initialMessages);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load group chat';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!user?.uid || !activeGroupChat) {
        setError('No active group chat selected');
        return;
      }

      if (!content.trim()) {
        return; // Don't send empty messages
      }

      try {
        // Send human message
        await sendGroupMessage(
          activeGroupChat.id,
          user.uid,
          'human',
          content.trim()
        );

        // Check if there's an AI agent in the group
        // This is completely async and never blocks message sending
        const agentId = getActiveAgentId();
        if (agentId) {
          // Trigger AI response asynchronously - errors are handled inside triggerAIResponse
          // This will never throw or block - it's fire-and-forget
          triggerAIResponse(content.trim(), agentId).catch((err) => {
            // Extra safety: catch any unexpected errors (shouldn't happen, but just in case)
            console.warn('⚠️ AI response error (caught in sendMessage):', err);
            // Don't set error state - AI is optional, message was sent successfully
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
      }
    },
    [user?.uid, activeGroupChat, getActiveAgentId, triggerAIResponse]
  );

  // Refresh group chats list
  const refreshGroupChats = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const chats = await getUserGroupChats(user.uid);
      setGroupChats(chats);
    } catch (err) {
      console.error('Error refreshing group chats:', err);
    }
  }, [user?.uid]);

  // Subscribe to group chats list on mount
  useEffect(() => {
    if (!user?.uid) return;

    // Load initial group chats
    refreshGroupChats();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToUserGroupChats(user.uid, (chats) => {
      setGroupChats(chats);
    });

    groupChatsUnsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid, refreshGroupChats]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      if (messagesUnsubscribeRef.current) {
        messagesUnsubscribeRef.current();
      }
      if (groupChatsUnsubscribeRef.current) {
        groupChatsUnsubscribeRef.current();
      }
    };
  }, []);

  return {
    groupChats,
    activeGroupChat,
    messages,
    isLoading,
    error,
    createGroup,
    selectGroupChat,
    sendMessage,
    refreshGroupChats,
  };
}

// Import getGroupMessages directly
import { getGroupMessages as getGroupMessagesService } from '../services/groupChat.service';

// Helper function to get group messages
async function getGroupMessages(groupId: string): Promise<GroupChatMessage[]> {
  return getGroupMessagesService(groupId);
}

