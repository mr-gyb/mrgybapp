import React, { useState } from 'react';
import { Users, MessageCircle, Search, UserMinus } from 'lucide-react';
import { useFriendService } from '../hooks/useFriendService';
import { UserProfile } from '../types/friendship';

interface FriendsListProps {
  onChatSelect?: (friendUid: string, friendName: string) => void;
  className?: string;
}

const FriendsList: React.FC<FriendsListProps> = ({ 
  onChatSelect,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const { 
    friends, 
    loading: friendsLoading, 
    error, 
    startChat 
  } = useFriendService();

  const handleStartChat = async (friend: UserProfile) => {
    if (loading.has(friend.uid)) return;

    try {
      setLoading(prev => new Set(prev).add(friend.uid));
      
      const chatRoomId = await startChat(friend.uid);
      
      if (chatRoomId && onChatSelect) {
        onChatSelect(friend.uid, friend.name);
      }
      
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(friend.uid);
        return newSet;
      });
    }
  };

  const filteredFriends = friends.filter(friend => {
    const searchLower = searchTerm.toLowerCase();
    return friend.name.toLowerCase().includes(searchLower) || 
           friend.businessName.toLowerCase().includes(searchLower) ||
           friend.industry.toLowerCase().includes(searchLower);
  });

  if (friendsLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
            Loading friends...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-6">
          <div className="text-center">
            <Users size={48} className="mx-auto text-red-300 dark:text-red-600 mb-3" />
            <p className="text-red-500 dark:text-red-400 mb-2">
              Error loading friends
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-gray-600 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Friends
            </h3>
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
              {friends.length}
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Friends List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredFriends.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {searchTerm ? 'No friends found matching your search' : 'No friends yet'}
            </p>
            {!searchTerm && (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Start by adding friends to your network
              </p>
            )}
          </div>
        ) : (
          filteredFriends.map((friend) => {
            const isStartingChat = loading.has(friend.uid);
            
            return (
              <div
                key={friend.uid}
                className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {/* Friend Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {friend.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {friend.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {friend.businessName} • {friend.industry}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartChat(friend)}
                      disabled={isStartingChat}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-xs font-medium rounded-md transition-colors"
                    >
                      {isStartingChat ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <MessageCircle size={14} />
                      )}
                      {isStartingChat ? 'Starting...' : 'Chat'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {filteredFriends.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {filteredFriends.length} friend{filteredFriends.length !== 1 ? 's' : ''} in your network
          </p>
        </div>
      )}
    </div>
  );
};

export default FriendsList;