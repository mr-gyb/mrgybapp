import React, { useState, useEffect } from 'react';
import { ChevronLeft, Facebook, BarChart3, Calendar, Image, Link, Users } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import FacebookLogin from './FacebookLogin';
import FacebookPostUploader from './FacebookPostUploader';
import { FacebookAccount } from '../../../api/services/facebook-integration.service';

const FacebookIntegration: React.FC = () => {
  const [connectedAccount, setConnectedAccount] = useState<FacebookAccount | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'post' | 'analytics'>('overview');

  const handleConnect = (account: FacebookAccount) => {
    setConnectedAccount(account);
  };

  const handleDisconnect = () => {
    setConnectedAccount(null);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Facebook },
    { id: 'post', label: 'Create Post', icon: Image },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="bg-white min-h-screen text-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <RouterLink to="/settings/integrations" className="mr-4 text-gray-600 hover:text-gray-900">
            <ChevronLeft size={24} />
          </RouterLink>
          <div className="flex items-center space-x-3">
            <Facebook className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Facebook Integration</h1>
              <p className="text-gray-600">Connect and manage your Facebook presence</p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mb-8">
          <FacebookLogin onConnect={handleConnect} onDisconnect={handleDisconnect} />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Connected Account</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {connectedAccount ? '1' : '0'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Image className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Posts Created</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {connectedAccount ? 'Ready' : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Analytics</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {connectedAccount ? 'Available' : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Overview */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">What You Can Do</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-1 bg-blue-100 rounded">
                        <Image className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Create Posts</h4>
                        <p className="text-sm text-gray-600">
                          Share text, links, and images directly to Facebook
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="p-1 bg-green-100 rounded">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Schedule Posts</h4>
                        <p className="text-sm text-gray-600">
                          Plan your content for optimal engagement times
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-1 bg-purple-100 rounded">
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Track Performance</h4>
                        <p className="text-sm text-gray-600">
                          Monitor post engagement and reach metrics
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="p-1 bg-orange-100 rounded">
                        <Link className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Multi-Format Support</h4>
                        <p className="text-sm text-gray-600">
                          Support for text, images, links, and rich media
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Getting Started */}
              {!connectedAccount && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-3">Get Started</h3>
                  <p className="text-blue-800 mb-4">
                    Connect your Facebook account to start creating and managing posts directly from GYB.
                  </p>
                  <div className="space-y-2 text-sm text-blue-700">
                    <p>• Click "Connect Facebook Account" above</p>
                    <p>• Grant necessary permissions for posting</p>
                    <p>• Start creating engaging content</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'post' && (
            <FacebookPostUploader isConnected={!!connectedAccount} />
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {connectedAccount ? 'Analytics Coming Soon' : 'Connect to View Analytics'}
                </h3>
                <p className="text-gray-600">
                  {connectedAccount 
                    ? 'Post performance analytics and insights will be available here soon.'
                    : 'Connect your Facebook account to access post analytics and insights.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacebookIntegration;
