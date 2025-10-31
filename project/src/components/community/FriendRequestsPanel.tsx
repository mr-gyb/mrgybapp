import React, { useState, useEffect } from "react";
import { Check, X, UserPlus, Clock } from "lucide-react";
import { acceptFriendRequest, declineFriendRequest } from "../../services/friendRequests";
import { useAuth } from "../../contexts/AuthContext";
import { useFriendRequests, FriendRequestWithNames } from "../../hooks/useFriendRequests";
import { Badge } from "../common/Badge";
import { useNavigate } from "react-router-dom";

export const FriendRequestsPanel: React.FC = () => {
  const { user } = useAuth();
  const uid = user?.uid || null;
  const { pendingRequests, sentRequests, isLoading } = useFriendRequests(uid);
  const [tab, setTab] = useState<"incoming"|"sent">("incoming");
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const navigate = useNavigate();

  const handleAccept = async (requestId: string, senderId: string) => {
    if (!uid) return;
    setLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const chatRoomId = await acceptFriendRequest(requestId, uid);
      console.log('✅ Friend request accepted, chat room:', chatRoomId);
      // Navigate to chat if room was created
      if (chatRoomId) {
        navigate(`/gyb-team-chat?room=${chatRoomId}`);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    } finally {
      setLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleDecline = async (requestId: string) => {
    if (!uid) return;
    setLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      await declineFriendRequest(requestId, uid);
      console.log('✅ Friend request declined');
    } catch (error) {
      console.error('Error declining friend request:', error);
    } finally {
      setLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  if (!uid) return null;

  const badgeCount = pendingRequests.length;
  
  // Debug logging for badge count
  console.log('🔔 FriendRequestsPanel: Rendering with', badgeCount, 'pending requests');
  console.log('🔔 FriendRequestsPanel: pendingRequests array:', pendingRequests);
  console.log('🔔 FriendRequestsPanel: Badge count rendering:', badgeCount);
  
  // Log when badge count changes
  React.useEffect(() => {
    console.log('🔔 FriendRequestsPanel: Badge count changed to:', badgeCount);
    console.log('🔔 FriendRequestsPanel: Full pendingRequests:', pendingRequests.map(r => ({ id: r.id, senderName: r.senderName })));
  }, [badgeCount, pendingRequests]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <UserPlus size={18} className="text-gray-600 dark:text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Friend Requests
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button 
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            tab === "incoming" 
              ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`} 
          onClick={() => setTab("incoming")}
        >
          <div className="flex items-center justify-center gap-2">
            <span>Incoming</span>
            <Badge count={badgeCount} />
          </div>
        </button>
        <button 
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            tab === "sent" 
              ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`} 
          onClick={() => setTab("sent")}
        >
          <div className="flex items-center justify-center gap-2">
            <span>Sent</span>
            {sentRequests.length > 0 && (
              <Badge count={sentRequests.length} className="bg-gray-500" />
            )}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Loading...</p>
          </div>
        ) : tab === "incoming" ? (
          pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <UserPlus size={48} className="mx-auto mb-4 opacity-50" />
              <p>No incoming friend requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {(request.senderName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {request.senderName || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {request.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAccept(request.id, request.senderId)}
                      disabled={loading[request.id]}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <Check size={14} />
                      {loading[request.id] ? 'Accepting...' : 'Accept'}
                    </button>
                    <button 
                      onClick={() => handleDecline(request.id)}
                      disabled={loading[request.id]}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <X size={14} />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          sentRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No sent requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-medium">
                      {(request.receiverName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {request.receiverName || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {request.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default FriendRequestsPanel;