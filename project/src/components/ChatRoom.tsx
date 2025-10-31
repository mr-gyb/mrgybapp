import React, { useState, useEffect, useRef } from 'react';
import VoiceInput from './VoiceInput';
import { Send, ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { 
  watchMessages, 
  sendMessage, 
  markMessagesAsRead,
  Message 
} from '../services/chat.service';
import { getUserProfile } from '../services/userFriendship.service';

interface ChatRoomProps {
  chatRoomId: string;
  friendName: string;
  onBack?: () => void;
  className?: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ 
  chatRoomId, 
  friendName, 
  onBack,
  className = '' 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const { showError } = useToast();

  // Watch messages in real-time
  useEffect(() => {
    if (!isAuthenticated || !user?.uid || !chatRoomId) return;

    console.log('💬 Setting up messages listener for chat room:', chatRoomId);
    
    const unsubscribe = watchMessages(chatRoomId, (newMessages) => {
      console.log('💬 Received messages:', newMessages.length);
      setMessages(newMessages);
      setLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up messages listener');
      unsubscribe();
    };
  }, [isAuthenticated, user?.uid, chatRoomId]);

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    if (!user?.uid || !chatRoomId || messages.length === 0) return;

    const markAsRead = async () => {
      try {
        await markMessagesAsRead(chatRoomId, user.uid);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markAsRead();
  }, [chatRoomId, user?.uid, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user?.uid || sending) return;

    try {
      setSending(true);
      await sendMessage(chatRoomId, user.uid, newMessage.trim());
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      showError(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const isMyMessage = (message: Message) => message.sender === user?.uid;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          )}
          
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {friendName.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {friendName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
            <Phone size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
            <Video size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
            <MoreVertical size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                Start a conversation with {friendName}
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isMyMessage(message)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  isMyMessage(message) 
                    ? 'text-blue-100' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <VoiceInput
          onTranscript={(transcript) => {
            setNewMessage(transcript);
            // Auto-send after voice input
            setTimeout(() => {
              handleSendMessage();
            }, 500);
          }}
          onError={(error) => {
            console.error('Voice input error:', error);
            showError(`Voice input error: ${error}`);
          }}
          disabled={sending}
          placeholder={`Message ${friendName}...`}
          showTranscript={true}
          autoSubmit={false}
          className="chat-room-voice-input"
        />
      </div>
    </div>
  );
};

export default ChatRoom;
