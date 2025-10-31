import React, { useState } from 'react';
import { Users, MessageCircle, Bell, Search } from 'lucide-react';
import ChatInterface from './ChatInterface';
import { useUserNotifications } from '../hooks/useNotifications';

const FriendshipDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'chat'>('friends');
  const { unreadCount, friendRequestCount } = useUserNotifications();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">GYB</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Friendship & Chat
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Bell size={16} />
                <span>{unreadCount} notifications</span>
                {friendRequestCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {friendRequestCount} requests
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Features Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Features
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <Users size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Friend Management
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Send, accept, and manage friend requests
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={16} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Real-time Chat
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Instant messaging with friends
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <Bell size={16} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Real-time friend request alerts
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                    <Search size={16} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Friend Search
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Find and connect with users
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            <ChatInterface className="h-[600px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendshipDemo;
