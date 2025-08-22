import React, { useState, useEffect } from 'react';
import { X, Instagram, Camera, User, LogOut, AlertCircle, CheckCircle } from 'lucide-react';
import { InstagramAccount } from '../../types/instagram';
import { instagramIntegrationService } from '../../services/instagramIntegration.service';

interface InstagramIntegrationManagerProps {
  onClose: () => void;
  onPostUploaded?: (result: any) => void;
}

const InstagramIntegrationManager: React.FC<InstagramIntegrationManagerProps> = ({ 
  onClose, 
  onPostUploaded 
}) => {
  const [connectedAccount, setConnectedAccount] = useState<InstagramAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const status = await instagramIntegrationService.getLoginStatus();
      if (status.status === 'connected') {
        const userProfile = await instagramIntegrationService.getUserProfile();
        setConnectedAccount(userProfile);
      }
    } catch (err) {
      console.error('Error checking connection status:', err);
      setError('Failed to check connection status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      await instagramIntegrationService.loginToInstagram();
      await checkConnectionStatus();
      setSuccess('Successfully connected to Instagram!');
    } catch (err) {
      console.error('Instagram login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to Instagram. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await instagramIntegrationService.logoutFromInstagram();
      setConnectedAccount(null);
      setSuccess('Successfully disconnected from Instagram');
    } catch (err) {
      console.error('Instagram logout error:', err);
      setError('Failed to disconnect from Instagram');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Instagram className="h-8 w-8 text-pink-600" />
            <h2 className="text-2xl font-bold text-gray-900">Instagram Integration</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="mb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Instagram className="h-6 w-6 text-pink-600" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Instagram Account</h3>
                  <p className="text-gray-600">
                    {connectedAccount 
                      ? `Connected as @${connectedAccount.username}` 
                      : 'Not connected to Instagram'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!connectedAccount ? (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Instagram className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Connecting...' : 'Connect Instagram'}</span>
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>{isLoading ? 'Disconnecting...' : 'Disconnect Instagram'}</span>
            </button>
          )}
        </div>

        {/* Account Info */}
        {connectedAccount && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Account Information</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Username: @{connectedAccount.username}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>Account Type: {connectedAccount.isBusiness ? 'Business' : 'Personal'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Important Notes */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">Important Notes</h4>
          <div className="text-xs text-yellow-800 space-y-1">
            <p>• Instagram Basic Display API only allows reading data</p>
            <p>• Posting requires Instagram Graph API (Business accounts)</p>
            <p>• This integration is for content analysis and insights</p>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstagramIntegrationManager;
