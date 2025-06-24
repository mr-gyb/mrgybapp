import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import AIVideoAvatar from './AIVideoAvatar';
import HomeFilter from './filters/HomeFilter';
import ChatHeader from './chat/ChatHeader';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';
import { OpenAIMessage } from '../types/chat';
import { useNavigate } from 'react-router-dom';
import { ChatCompletionContentPart } from "openai/resources/chat/completions";

const NewChat: React.FC = () => {
  const { user } = useAuth();
  const { addMessage, updateChatTitle, createNewChat, chats, currentChatId, newchatButton, addImage, selectedAgent, setSelectedAgent } = useChat();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('New Chat');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [videoAvatar, setVideoAvatar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initChat = async () => {
      try {
        if (!currentChatId) {
          console.log("creating new chat");
          const newChatId = await createNewChat();
          if (newChatId) {
            const initialMessage = `Hello! I'm ${selectedAgent || 'Mr.GYB AI'}. How can I help you today?`;
            await addMessage(newChatId, initialMessage, 'assistant', undefined, selectedAgent || 'Mr.GYB AI');
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initChat();
  }, [currentChatId, createNewChat, addMessage, selectedAgent]);

  const currentChat = currentChatId
    ? chats.find((chat) => chat.id === currentChatId)
    : null;

  const handleSendMessage = async (content: string | OpenAIMessage | ChatCompletionContentPart[]) => {
    if (!currentChatId || isProcessing) return;
    setIsProcessing(true);

    try {
      if (typeof content === 'object' && Array.isArray(content)) {
        // Handle ChatCompletionContentPart[] case
        await addImage(currentChatId, content, 'user', user?.uid);
      } else {
        // Handle string or OpenAIMessage case
        await addMessage(currentChatId, content, 'user', user?.uid);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTitleUpdate = async () => {
    if (currentChatId && editedTitle.trim()) {
      const success = await updateChatTitle(currentChatId, editedTitle.trim());
      if (success) {
        setIsEditing(false);
      }
    }
  };

  // for agent change - create new chat with selected agent
  const handleAgentChange = async (newAgent: string) => {
    if (newAgent === selectedAgent) return; // No change needed
    
    try {
      // First, check if there's an existing chat with this agent
      const existingChat = chats.find(chat => {
        // Check if the chat has messages from this agent
        return chat.messages && chat.messages.some(message => 
          message.role === 'assistant' && message.aiAgent === newAgent
        );
      });

      if (existingChat) {
        // If existing chat found, navigate to it
        navigate(`/chat/${existingChat.id}`);
        // Get the actual agent from the existing chat's messages
        const agentMessage = existingChat.messages?.find(message => 
          message.role === 'assistant' && message.aiAgent === newAgent
        );
        if (agentMessage?.aiAgent) {
          setSelectedAgent(agentMessage.aiAgent);
        } else {
          setSelectedAgent(newAgent);
        }
      } else {
        // If no existing chat, create new chat with the selected agent
        const newChatId = await createNewChat();
        if (newChatId) {
          // Add initial message from the new agent
          const initialMessage = `Hello! I'm ${newAgent}. How can I help you today?`;
          await addMessage(newChatId, initialMessage, 'assistant', undefined, newAgent);
          
          // Navigate to the new chat
          navigate(`/chat/${newChatId}`);
          // Update the selected agent state
          setSelectedAgent(newAgent);
        }
      }
    } catch (error) {
      console.error('Error handling agent change:', error);
    }
  };

  if (isInitializing || !currentChat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-blue"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <ChatHeader
        title={currentChat.title}
        isEditing={isEditing}
        editedTitle={editedTitle}
        onEditToggle={() => setIsEditing(true)}
        onTitleChange={setEditedTitle}
        onTitleUpdate={handleTitleUpdate}
        onTitleCancel={() => {
          setIsEditing(false);
          setEditedTitle(currentChat.title);
        }}
        onAgentChange={handleAgentChange}
        onNewChat={newchatButton}
      />

      <div className="flex-1 overflow-hidden relative mt-16">
        {videoAvatar ? (
          <AIVideoAvatar />
        ) : (
          <MessageList messages={currentChat.messages || []} />
        )}
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        isProcessing={isProcessing}
        videoAvatar={videoAvatar}
        setVideoAvatar={setVideoAvatar}
      />

      <HomeFilter onFilterChange={() => {}} />
    </div>
  );
};

export default NewChat;