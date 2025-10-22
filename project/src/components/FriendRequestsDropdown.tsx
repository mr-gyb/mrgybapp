import React, { useState, useEffect } from 'react';
import { Bell, Check, X, User, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { 
  watchIncomingRequests,
  acceptFriendRequest,
  declineFriendRequest
} from '../services/friends';

interface FriendRequestsDropdownProps {
  className?: string;
}

const FriendRequestsDropdown: React.FC<FriendRequestsDropdownProps> = ({ 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<string[]>([]);
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  // Watch incoming requests
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) return;

    const unsubscribe = watchIncomingRequests(user.uid, (requests) => {
      setIncomingRequests(requests);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  const handleAccept = async (senderUid: string) => {
    if (!user?.uid || loading.has(senderUid)) return;

    try {
      setLoading(prev => new Set(prev).add(senderUid));
      await acceptFriendRequest(user.uid, senderUid);
      showSuccess('Friend request accepted!');
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

  const handleDecline = async (senderUid: string) => {
    if (!user?.uid || loading.has(senderUid)) return;

    try {
      setLoading(prev => new Set(prev).add(senderUid));
      await declineFriendRequest(user.uid, senderUid);
      showSuccess('Friend request declined');
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
        {incomingRequests.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {incomingRequests.length > 9 ? '9+' : incomingRequests.length}
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
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Friend Requests
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {incomingRequests.length} pending request{incomingRequests.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Requests List */}
            <div className="max-h-96 overflow-y-auto">
              {incomingRequests.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <User size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No pending friend requests
                  </p>
                </div>
              ) : (
                incomingRequests.map((senderUid) => (
                  <div
                    key={senderUid}
                    className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {/* Request Info */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {senderUid.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {senderUid}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={12} />
                          <span>Just now</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(senderUid)}
                        disabled={loading.has(senderUid)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm font-medium rounded-md transition-colors"
                      >
                        {loading.has(senderUid) ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                        Accept
                      </button>
                      
                      <button
                        onClick={() => handleDecline(senderUid)}
                        disabled={loading.has(senderUid)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium rounded-md transition-colors"
                      >
                        {loading.has(senderUid) ? (
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
            {incomingRequests.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Accepting will automatically create a chat room
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FriendRequestsDropdown;
