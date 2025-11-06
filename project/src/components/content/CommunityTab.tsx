import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, MessageCircle, UserMinus, Users, Newspaper, Edit } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import CreatePostModal from '../community/CreatePostModal';
import CommunityNav from '../community/CommunityNav';
import FeedView from '../community/FeedView';
import GridView from '../community/GridView';
import MapView from '../community/MapView';

interface CommunityTabProps {
  className?: string;
}

type UserStatus = 'add' | 'requested' | 'pending' | 'friends';
type ViewMode = 'feed' | 'users';
type CommunityView = 'feed' | 'grid' | 'map';

const CommunityTab: React.FC<CommunityTabProps> = ({ className = '' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('feed');
  const [communityView, setCommunityView] = useState<CommunityView>('feed');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<string[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<string[]>([]);
  const [connections, setConnections] = useState<string[]>([]);
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  
  const { user, userData, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Check if map view is enabled
  const isMapEnabled = import.meta.env.VITE_COMMUNITY_MAP_ENABLED === 'true';

  // Initialize community view from URL query param
  useEffect(() => {
    const viewParam = searchParams.get('view') as CommunityView;
    if (viewParam && ['feed', 'grid', 'map'].includes(viewParam)) {
      if (viewParam === 'map' && !isMapEnabled) {
        // If map is requested but not enabled, default to feed
        setCommunityView('feed');
        setSearchParams({ view: 'feed' });
      } else {
        setCommunityView(viewParam);
      }
    } else {
      // Default to feed if no valid view param
      setCommunityView('feed');
      if (!searchParams.get('view')) {
        setSearchParams({ view: 'feed' });
      }
    }
  }, [searchParams, isMapEnabled, setSearchParams]);

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

  // Get user avatar
  const getUserAvatar = () => {
    if (userData?.profile_image_url && userData.profile_image_url.startsWith('http')) {
      return userData.profile_image_url;
    }
    return null;
  };

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
      {/* Header: Left Avatar, Center Title, Right GYB Badge */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          {/* Left: Small Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
            {getUserAvatar() ? (
              <img 
                src={getUserAvatar()!} 
                alt={userData?.name || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-xs">
                {userData?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>

          {/* Center: Community Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 text-center">
            Community
          </h3>

          {/* Right: GYB Circle Badge */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">GYB</span>
          </div>
        </div>

        {/* Search and Create Post Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              style={{ fontSize: '14px', borderRadius: '8px' }}
            />
          </div>
          {viewMode === 'feed' && (
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  showError('Please sign in to create a post');
                  return;
                }
                setIsCreatePostModalOpen(true);
              }}
              className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center relative group"
              aria-label="Create Post"
              style={{ borderRadius: '8px' }}
            >
              {/* Outlined square with pen icon */}
              <div className="relative w-5 h-5 border border-gray-400 dark:border-gray-400 rounded" style={{ borderRadius: '4px' }}>
                <Edit size={12} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300" />
              </div>
              {!isAuthenticated && (
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Sign in to interact
                </span>
              )}
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setViewMode('feed')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'feed'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Newspaper size={16} />
            Feed
          </button>
          <button
            onClick={() => setViewMode('users')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'users'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Users size={16} />
            Users
          </button>
        </div>
      </div>

      {/* Community Sub-Navigation (Feed/Grid/Map) */}
      {viewMode === 'feed' && (
        <div className="px-4 pt-2">
          <CommunityNav
            activeView={communityView}
            onViewChange={(view) => {
              setCommunityView(view);
              setSearchParams({ view });
            }}
            showMap={isMapEnabled}
          />
        </div>
      )}

      {/* Feed/Grid/Map Views */}
      {viewMode === 'feed' && (
        <div className="p-4">
          {communityView === 'feed' && <FeedView searchTerm={searchTerm} />}
          {communityView === 'grid' && <GridView searchTerm={searchTerm} />}
          {communityView === 'map' && <MapView />}
        </div>
      )}

      {/* Users View */}
      {viewMode === 'users' && (
        <>
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
        </>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPostCreated={() => {
          setIsCreatePostModalOpen(false);
        }}
      />
    </div>
  );
};

export default CommunityTab;
