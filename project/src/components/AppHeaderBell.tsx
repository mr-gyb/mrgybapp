import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePendingRequests } from '../hooks/usePendingRequests';
import { Badge } from './common/Badge';

interface AppHeaderBellProps {
  className?: string;
}

const AppHeaderBell: React.FC<AppHeaderBellProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const uid = user?.uid || null;
  const { pendingRequests } = usePendingRequests(uid);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const badgeCount = pendingRequests.length;
  
  // Debug logging for badge count in bell icon
  console.log('🔔 AppHeaderBell: Rendering with', badgeCount, 'pending requests');
  console.log('🔔 AppHeaderBell: pendingRequests array:', pendingRequests);
  console.log('🔔 AppHeaderBell: Badge count rendering:', badgeCount);
  
  // Log when badge count changes
  useEffect(() => {
    console.log('🔔 AppHeaderBell: Badge count changed to:', badgeCount);
    console.log('🔔 AppHeaderBell: Full pendingRequests:', pendingRequests.map(r => ({ id: r.id, senderName: r.senderName })));
  }, [badgeCount, pendingRequests]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
        aria-label={`Notifications ${badgeCount > 0 ? `(${badgeCount} unread)` : ''}`}
      >
        <Bell size={20} />
        <Badge count={badgeCount} className="absolute -top-1 -right-1" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <Bell size={48} className="mx-auto mb-4 opacity-50" />
                <p>No new friend requests</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {(request.senderName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <UserPlus size={14} className="text-blue-500" />
                          <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">{request.senderName || 'Someone'}</span>{' '}
                            sent you a friend request
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatTime(request.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pendingRequests.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Open Friend Requests to respond
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppHeaderBell;