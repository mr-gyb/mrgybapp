import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import AIVideoAvatar from './AIVideoAvatar';
import HomeFilter from './filters/HomeFilter';
import ChatHeader from './chat/ChatHeader';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';
import { OpenAIMessage } from '../types/chat';

const NewChat: React.FC = () => {
  const { user } = useAuth();
  const { addMessage, updateChatTitle, createNewChat, chats, currentChatId, newchatButton } = useChat();
  const [selectedAgent, setSelectedAgent] = useState('Mr.GYB AI');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('New Chat');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [videoAvatar, setVideoAvatar] = useState(false);

  useEffect(() => {
    const initChat = async () => {
      try {
        if (!currentChatId) {
          console.log("creating new chat");
          const newChatId = await createNewChat();
          if (newChatId) {
            const initialMessage = `Hello! I'm ${selectedAgent}. How can I help you today?`;
            await addMessage(newChatId, initialMessage, 'assistant', undefined, selectedAgent);
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

  const handleSendMessage = async (content: string | OpenAIMessage) => {
    if (!currentChatId || isProcessing) return;
    setIsProcessing(true);

    try {
      await addMessage(currentChatId, content, 'user', user?.uid);
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
        currentAgent={selectedAgent}
        isEditing={isEditing}
        editedTitle={editedTitle}
        onEditToggle={() => setIsEditing(true)}
        onTitleChange={setEditedTitle}
        onTitleUpdate={handleTitleUpdate}
        onTitleCancel={() => {
          setIsEditing(false);
          setEditedTitle(currentChat.title);
        }}
        onAgentChange={setSelectedAgent}
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