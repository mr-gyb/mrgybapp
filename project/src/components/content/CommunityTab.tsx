import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, MessageCircle, UserMinus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { 
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeConnection,
  watchIncomingRequests,
  watchOutgoingRequests,
  watchConnections
} from '../../services/friends';
import { ensureDirectRoom } from '../../services/chat';
import { UserProfile } from '../../types/friendships';

interface CommunityTabProps {
  className?: string;
}

type UserStatus = 'add' | 'requested' | 'pending' | 'friends';

const CommunityTab: React.FC<CommunityTabProps> = ({ className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<string[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<string[]>([]);
  const [connections, setConnections] = useState<string[]>([]);
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [pendingCount, setPendingCount] = useState(0);
  
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Mock users data - replace with actual user search API
  const mockUsers: UserProfile[] = [
    {
      uid: 'user1',
      name: 'Jane Doe',
      businessName: 'Tech Solutions Inc',
      industry: 'Technology',
      email: 'jane@techsolutions.com',
      friends: [],
      pendingRequests: [],
      sentRequests: [],
      notifications: []
    },
    {
      uid: 'user2',
      name: 'John Smith',
      businessName: 'Marketing Pro',
      industry: 'Marketing',
      email: 'john@marketingpro.com',
      friends: [],
      pendingRequests: [],
      sentRequests: [],
      notifications: []
    },
    {
      uid: 'user3',
      name: 'Mike Wilson',
      businessName: 'Design Studio',
      industry: 'Design',
      email: 'mike@designstudio.com',
      friends: [],
      pendingRequests: [],
      sentRequests: [],
      notifications: []
    }
  ];

  // Watch incoming requests
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) return;

    const unsubscribe = watchIncomingRequests(user.uid, (requests) => {
      setIncomingRequests(requests);
      setPendingCount(requests.length);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  // Watch outgoing requests
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) return;

    const unsubscribe = watchOutgoingRequests(user.uid, (requests) => {
      setOutgoingRequests(requests);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  // Watch connections
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) return;

    const unsubscribe = watchConnections(user.uid, (friends) => {
      setConnections(friends);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  // Load users (mock implementation)
  useEffect(() => {
    // Filter out current user
    const filteredUsers = mockUsers.filter(u => u.uid !== user?.uid);
    setUsers(filteredUsers);
  }, [user?.uid]);

  const getUserStatus = (targetUid: string): UserStatus => {
    if (connections.includes(targetUid)) return 'friends';
    if (incomingRequests.includes(targetUid)) return 'pending';
    if (outgoingRequests.includes(targetUid)) return 'requested';
    return 'add';
  };

  const handleSendRequest = async (targetUid: string, targetName: string) => {
    if (!user?.uid || loading.has(targetUid)) return;

    try {
      setLoading(prev => new Set(prev).add(targetUid));
      await sendFriendRequest(user.uid, targetUid);
      showSuccess(`Friend request sent to ${targetName}`);
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      showError(error.message || 'Failed to send friend request');
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUid);
        return newSet;
      });
    }
  };

  const handleAcceptRequest = async (senderUid: string, senderName: string) => {
    if (!user?.uid || loading.has(senderUid)) return;

    try {
      setLoading(prev => new Set(prev).add(senderUid));
      const roomId = await acceptFriendRequest(user.uid, senderUid);
      showSuccess(`Friend request from ${senderName} accepted!`);
      
      // Navigate to the chat room
      navigate(`/gyb-team-chat?room=${roomId}`);
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      showError(error.message || 'Failed to accept friend request');
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(senderUid);
        return newSet;
      });
    }
  };

  const handleDeclineRequest = async (senderUid: string, senderName: string) => {
    if (!user?.uid || loading.has(senderUid)) return;

    try {
      setLoading(prev => new Set(prev).add(senderUid));
      await declineFriendRequest(user.uid, senderUid);
      showSuccess(`Friend request from ${senderName} declined`);
    } catch (error: any) {
      console.error('Error declining friend request:', error);
      showError(error.message || 'Failed to decline friend request');
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(senderUid);
        return newSet;
      });
    }
  };

  const handleRemoveFriend = async (friendUid: string, friendName: string) => {
    if (!user?.uid || loading.has(friendUid)) return;

    try {
      setLoading(prev => new Set(prev).add(friendUid));
      await removeConnection(user.uid, friendUid);
      showSuccess(`${friendName} removed from friends`);
    } catch (error: any) {
      console.error('Error removing friend:', error);
      showError(error.message || 'Failed to remove friend');
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(friendUid);
        return newSet;
      });
    }
  };

  const handleStartChat = async (friendUid: string, _friendName: string) => {
    if (!user?.uid || loading.has(friendUid)) return;

    try {
      setLoading(prev => new Set(prev).add(friendUid));
      const roomId = await ensureDirectRoom(user.uid, friendUid);
      navigate(`/gyb-team-chat?room=${roomId}`);
    } catch (error: any) {
      console.error('Error starting chat:', error);
      showError(error.message || 'Failed to start chat');
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(friendUid);
        return newSet;
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return user.name.toLowerCase().includes(searchLower) || 
           user.businessName.toLowerCase().includes(searchLower) ||
           user.industry.toLowerCase().includes(searchLower);
  });

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Please sign in to access the community
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header with Pending Count Badge */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-gray-600 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Community
            </h3>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No users found matching your search' : 'No users available'}
            </p>
          </div>
        ) : (
          filteredUsers.map((userProfile) => {
            const status = getUserStatus(userProfile.uid);
            const isProcessing = loading.has(userProfile.uid);
            
            return (
              <div
                key={userProfile.uid}
                className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {userProfile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {userProfile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userProfile.businessName} • {userProfile.industry}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {status === 'add' && (
                      <button
                        onClick={() => handleSendRequest(userProfile.uid, userProfile.name)}
                        disabled={isProcessing}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs font-medium rounded-md transition-colors"
                      >
                        {isProcessing ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <UserPlus size={14} />
                        )}
                        {isProcessing ? 'Sending...' : 'Add Friend'}
                      </button>
                    )}
                    
                    {status === 'requested' && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                        Requested
                      </span>
                    )}
                    
                    {status === 'pending' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAcceptRequest(userProfile.uid, userProfile.name)}
                          disabled={isProcessing}
                          className="flex items-center gap-1 px-2 py-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-xs font-medium rounded-md transition-colors"
                        >
                          {isProcessing ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check size={12} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(userProfile.uid, userProfile.name)}
                          disabled={isProcessing}
                          className="flex items-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-xs font-medium rounded-md transition-colors"
                        >
                          {isProcessing ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <X size={12} />
                          )}
                        </button>
                      </div>
                    )}
                    
                    {status === 'friends' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStartChat(userProfile.uid, userProfile.name)}
                          disabled={isProcessing}
                          className="flex items-center gap-1 px-2 py-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-xs font-medium rounded-md transition-colors"
                        >
                          {isProcessing ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <MessageCircle size={12} />
                          )}
                        </button>
                        <button
                          onClick={() => handleRemoveFriend(userProfile.uid, userProfile.name)}
                          disabled={isProcessing}
                          className="flex items-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-xs font-medium rounded-md transition-colors"
                        >
                          {isProcessing ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <UserMinus size={12} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {filteredUsers.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}
    </div>
  );
};

export default CommunityTab;