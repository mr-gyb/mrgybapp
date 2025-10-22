import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Search, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  watchUserChatRooms,
  ChatRoomWithUsers 
} from '../services/chat.service';
import FriendsList from './FriendsList';
import ChatRoom from './ChatRoom';
import FriendSearch from './FriendSearch';
import EnhancedFriendRequestsMenu from './EnhancedFriendRequestsMenu';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '' }) => {
  const [activeView, setActiveView] = useState<'friends' | 'chat' | 'search'>('friends');
  const [selectedChatRoom, setSelectedChatRoom] = useState<{
    id: string;
    friendName: string;
  } | null>(null);
  const [showFriendSearch, setShowFriendSearch] = useState(false);
  const [chatRooms, setChatRooms] = useState<ChatRoomWithUsers[]>([]);
  const { user, isAuthenticated } = useAuth();

  // Watch user's chat rooms
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) return;

    console.log('💬 Setting up chat rooms listener for user:', user.uid);
    
    const unsubscribe = watchUserChatRooms(user.uid, (rooms) => {
      console.log('💬 Received chat rooms:', rooms.length);
      setChatRooms(rooms);
    });

    return () => {
      console.log('🧹 Cleaning up chat rooms listener');
      unsubscribe();
    };
  }, [isAuthenticated, user?.uid]);

  const handleChatRoomSelect = (chatRoomId: string, friendName: string) => {
    setSelectedChatRoom({ id: chatRoomId, friendName });
    setActiveView('chat');
  };

  const handleBackToFriends = () => {
    setSelectedChatRoom(null);
    setActiveView('friends');
  };

  const handleStartChat = (chatRoomId: string, friendName: string) => {
    handleChatRoomSelect(chatRoomId, friendName);
  };

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <MessageCircle size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Please sign in to access chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {activeView === 'chat' && (
            <button
              onClick={handleBackToFriends}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-gray-600 dark:text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeView === 'chat' ? 'Chat' : 'Friends & Chat'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <EnhancedFriendRequestsMenu />
          
          <button
            onClick={() => setShowFriendSearch(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Plus size={16} />
            Add Friend
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'friends' && (
          <FriendsList
            onChatRoomSelect={handleChatRoomSelect}
            className="h-full"
          />
        )}
        
        {activeView === 'chat' && selectedChatRoom && (
          <ChatRoom
            chatRoomId={selectedChatRoom.id}
            friendName={selectedChatRoom.friendName}
            onBack={handleBackToFriends}
            className="h-full"
          />
        )}
      </div>

      {/* Friend Search Modal */}
      <FriendSearch
        isOpen={showFriendSearch}
        onClose={() => setShowFriendSearch(false)}
      />
    </div>
  );
};

export default ChatInterface;
