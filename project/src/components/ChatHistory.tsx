import React, { useState } from 'react';
import { ChevronLeft, MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';

const ChatHistory: React.FC = () => {
  const navigate = useNavigate();
  const { chats, deleteChat, updateChatTitle, isLoading } = useChat();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  const handleChatClick = (chatId: string) => {
    if (editingChatId !== chatId) {
      navigate(`/chat/${chatId}`);
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      await deleteChat(chatId);
    }
  };

  const handleEditClick = (e: React.MouseEvent, chatId: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingChatId(chatId);
    setEditedTitle(currentTitle);
  };

  const handleTitleUpdate = async (e: React.MouseEvent | React.KeyboardEvent, chatId: string) => {
    e.stopPropagation();
    if (editedTitle.trim()) {
      const success = await updateChatTitle(chatId, editedTitle.trim());
      if (success) {
        setEditingChatId(null);
        setEditedTitle('');
      }
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
    setEditedTitle('');
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent, chatId: string) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleTitleUpdate(e, chatId);
    } else if (e.key === 'Escape') {
      handleCancelEdit(e as unknown as React.MouseEvent);
    }
  };

  const getLastMessage = (messages?: any[]) => {
    if (!messages || messages.length === 0) return 'No messages';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.content;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-blue"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4 text-navy-blue">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-navy-blue">Chat History</h1>
        </div>

        <div className="space-y-4">
          {chats.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No chat history available.</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
                className="bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-200 transition-colors group"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex-grow mr-4">
                    {editingChatId === chat.id ? (
                      <div className="flex items-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          onKeyDown={(e) => handleTitleKeyPress(e, chat.id)}
                          className="flex-grow px-2 py-1 rounded border border-navy-blue focus:outline-none focus:ring-2 focus:ring-navy-blue"
                          autoFocus
                        />
                        <button
                          onClick={(e) => handleTitleUpdate(e, chat.id)}
                          className="ml-2 p-1 hover:bg-navy-blue hover:text-white rounded transition-colors"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="ml-1 p-1 hover:bg-red-500 hover:text-white rounded transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <h2 className="text-xl font-semibold">{chat.title}</h2>
                        <button
                          onClick={(e) => handleEditClick(e, chat.id, chat.title)}
                          className="ml-2 p-1 hover:bg-navy-blue hover:text-white rounded opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(chat.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="flex items-center text-gray-600">
                  <MessageSquare size={16} className="mr-2" />
                  <p className="truncate">
                    {chat.messages && chat.messages.length > 0
                      ? getLastMessage(chat.messages)
                      : 'No messages'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;