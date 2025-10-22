import React, { useState, useEffect } from 'react';
import { Bell, Check, X, User, Clock, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { 
  watchIncomingRequests, 
  acceptFriendRequest, 
  declineFriendRequest,
  FriendRequestWithUser 
} from '../services/userFriendship.service';
import { getOrCreateChatRoom } from '../services/chat.service';

interface EnhancedFriendRequestsMenuProps {
  className?: string;
  onChatRoomSelect?: (chatRoomId: string, friendName: string) => void;
}

const EnhancedFriendRequestsMenu: React.FC<EnhancedFriendRequestsMenuProps> = ({ 
  className = '',
  onChatRoomSelect 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState<FriendRequestWithUser[]>([]);
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  // Watch incoming friend requests
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) return;

    console.log('🔔 Setting up enhanced friend requests listener for user:', user.uid);
    
    const unsubscribe = watchIncomingRequests(user.uid, (incomingRequests) => {
      console.log('📨 Received friend requests:', incomingRequests.length);
      setRequests(incomingRequests);
    });

    return () => {
      console.log('🧹 Cleaning up enhanced friend requests listener');
      unsubscribe();
    };
  }, [isAuthenticated, user?.uid]);

  const handleAccept = async (request: FriendRequestWithUser) => {
    if (loading.has(request.id)) return;

    try {
      setLoading(prev => new Set(prev).add(request.id));
      
      await acceptFriendRequest(request.id);
      showSuccess(`Friend request from ${request.fromUser.name} accepted!`);
      
      // Auto-create chat room and start conversation
      if (onChatRoomSelect) {
        try {
          const chatRoomId = await getOrCreateChatRoom(user.uid, request.fromUid);
          onChatRoomSelect(chatRoomId, request.fromUser.name);
        } catch (error) {
          console.error('Error creating chat room:', error);
        }
      }
      
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      showError(error.message || 'Failed to accept friend request');
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  };

  const handleReject = async (request: FriendRequestWithUser) => {
    if (loading.has(request.id)) return;

    try {
      setLoading(prev => new Set(prev).add(request.id));
      
      await declineFriendRequest(request.id);
      showSuccess(`Friend request from ${request.fromUser.name} declined`);
      
    } catch (error: any) {
      console.error('Error rejecting friend request:', error);
      showError(error.message || 'Failed to reject friend request');
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const requestTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - requestTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const pendingCount = requests.length;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Friend requests"
      >
        <Bell size={20} className="text-gray-600 dark:text-gray-300" />
        
        {/* Badge */}
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Friend Requests
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Requests List */}
            <div className="max-h-96 overflow-y-auto">
              {requests.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <User size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No pending friend requests
                  </p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    className="px-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {/* Request Info */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-lg">
                          {request.fromUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {request.fromUser.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {request.fromUser.businessName} • {request.fromUser.industry}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={12} />
                          <span>{formatTimeAgo(request.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(request)}
                        disabled={loading.has(request.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm font-medium rounded-md transition-colors"
                      >
                        {loading.has(request.id) ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                        Accept & Chat
                      </button>
                      
                      <button
                        onClick={() => handleReject(request)}
                        disabled={loading.has(request.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium rounded-md transition-colors"
                      >
                        {loading.has(request.id) ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <X size={16} />
                        )}
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {requests.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <MessageCircle size={12} />
                  <span>Accepting will automatically start a chat</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EnhancedFriendRequestsMenu;
