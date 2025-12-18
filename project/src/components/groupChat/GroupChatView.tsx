import React, { useState, useRef, useEffect } from 'react';
import { Plus, Send, Users, Bot, User } from 'lucide-react';
import { useGroupChat } from '../../hooks/useGroupChat';
import CreateGroupModal from './CreateGroupModal';
import { GroupChatMessage, SenderType } from '../../types/groupChat';
// Simple date formatter (replaces date-fns)
const formatDistanceToNow = (date: Date | string, options?: { addSuffix?: boolean }): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return dateObj.toLocaleDateString();
  } catch {
    return 'Just now';
  }
};

const GroupChatView: React.FC = () => {
  const {
    groupChats,
    activeGroupChat,
    messages,
    isLoading,
    error,
    createGroup,
    selectGroupChat,
    sendMessage,
  } = useGroupChat();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    await sendMessage(messageInput);
    setMessageInput('');
  };

  const formatTimestamp = (timestamp: string | Date) => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Just now';
    }
  };

  const getAvatar = (message: GroupChatMessage) => {
    if (message.avatar) return message.avatar;
    return message.senderType === 'ai' 
      ? '/images/team/mrgyb-ai.png' 
      : '/images/default-avatar.png';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Group Chats List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Group Chats</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Create new group chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Group Chats List */}
        <div className="flex-1 overflow-y-auto">
          {groupChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No group chats yet</p>
              <p className="text-sm mt-1">Create one to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {groupChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => selectGroupChat(chat.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    activeGroupChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {chat.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                      {chat.lastMessage && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          <span className="font-medium">{chat.lastMessageSender}:</span>{' '}
                          {chat.lastMessage}
                        </p>
                      )}
                      {chat.lastMessageAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(chat.lastMessageAt as string)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Active Chat Thread */}
      <div className="flex-1 flex flex-col">
        {activeGroupChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{activeGroupChat.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {activeGroupChat.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-1 text-sm text-gray-600"
                      >
                        {participant.type === 'ai' ? (
                          <Bot className="w-4 h-4 text-purple-600" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600" />
                        )}
                        <span>{participant.displayName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm mt-1">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isHuman = message.senderType === 'human';
                  const isCurrentUser = activeGroupChat?.createdBy === message.senderId;

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <img
                          src={getAvatar(message)}
                          alt={message.displayName || 'User'}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                          }}
                        />
                      </div>

                      {/* Message Content */}
                      <div className={`flex-1 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {message.displayName || 'Guest User'}
                          </span>
                          {message.senderType === 'ai' && (
                            <Bot className="w-4 h-4 text-purple-600" />
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(message.timestamp as string)}
                          </span>
                        </div>
                        <div
                          className={`rounded-lg px-4 py-2 max-w-md ${
                            isCurrentUser
                              ? 'bg-blue-600 text-white'
                              : message.senderType === 'ai'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <Users className="w-24 h-24 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No group chat selected</h3>
              <p className="text-gray-500 mb-4">Select a group chat from the list or create a new one</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create Group Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreate={async (input) => {
            const group = await createGroup(input);
            if (group) {
              setShowCreateModal(false);
            }
          }}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChatView;

