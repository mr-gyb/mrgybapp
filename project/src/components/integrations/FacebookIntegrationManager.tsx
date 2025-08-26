import React, { useState, useEffect } from 'react';
import { 
  Facebook, 
  Settings, 
  Link, 
  Unlink, 
  Upload, 
  User, 
  Building, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  ArrowRight,
  Shield,
  Info
} from 'lucide-react';
import { facebookIntegrationService } from '../../services/facebookIntegration.service';
import { FacebookAccount, FacebookPost, FacebookIntegrationStatus } from '../../types/facebook';

interface FacebookIntegrationManagerProps {
  onClose: () => void;
  onPostUploaded?: (result: any) => void;
}

const FacebookIntegrationManager: React.FC<FacebookIntegrationManagerProps> = ({
  onClose,
  onPostUploaded
}) => {
  const [integrationStatus, setIntegrationStatus] = useState<FacebookIntegrationStatus>({
    isConnected: false,
    pages: [],
    permissions: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<FacebookAccount | null>(null);
  const [postData, setPostData] = useState<FacebookPost>({
    message: '',
    privacy: 'EVERYONE'
  });

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  const checkIntegrationStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const status = await facebookIntegrationService.getLoginStatus();
      
      if (status.status === 'connected') {
        const [userProfile, pages] = await Promise.all([
          facebookIntegrationService.getUserProfile(),
          facebookIntegrationService.getUserPages()
        ]);
        
        setIntegrationStatus({
          isConnected: true,
          userProfile,
          pages,
          permissions: ['publish_actions', 'pages_manage_posts'],
          lastSync: new Date()
        });
      } else {
        setIntegrationStatus({
          isConnected: false,
          pages: [],
          permissions: []
        });
      }
    } catch (err) {
      setError('Failed to check integration status');
      console.error('Error checking integration status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await facebookIntegrationService.loginToFacebook();
      await checkIntegrationStatus();
    } catch (err) {
      setError('Facebook login failed. Please try again.');
      console.error('Facebook login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await facebookIntegrationService.logoutFromFacebook();
      setIntegrationStatus({
        isConnected: false,
        pages: [],
        permissions: []
      });
      setSelectedAccount(null);
      setShowPostForm(false);
    } catch (err) {
      setError('Failed to logout from Facebook');
      console.error('Facebook logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostUpload = async () => {
    if (!selectedAccount || !postData.message.trim()) {
      setError('Please select an account and enter a message');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const postId = await facebookIntegrationService.uploadPost(
        postData, 
        selectedAccount.id
      );
      
      // Reset form
      setPostData({ message: '', privacy: 'EVERYONE' });
      setShowPostForm(false);
      setSelectedAccount(null);
      
      // Notify parent component
      if (onPostUploaded) {
        onPostUploaded({
          success: true,
          postId,
          platform: 'facebook',
          account: selectedAccount.name
        });
      }
      
      // Show success message
      setError(null);
    } catch (err) {
      setError('Failed to upload post to Facebook');
      console.error('Post upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderIntegrationStatus = () => {
    if (integrationStatus.isConnected) {
      return (
        <div className="space-y-4">
          {/* User Profile */}
          {integrationStatus.userProfile && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-green-800">Connected to Facebook</h3>
                  <p className="text-sm text-green-600">
                    {integrationStatus.userProfile.name} ({integrationStatus.userProfile.email})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pages */}
          {integrationStatus.pages.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Connected Pages</h3>
              <div className="space-y-2">
                {integrationStatus.pages.map((page) => (
                  <div key={page.id} className="flex items-center space-x-2 text-sm text-blue-700">
                    <Building className="w-4 h-4" />
                    <span>{page.name}</span>
                    <span className="text-blue-500">({page.category})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Permissions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Permissions Granted</h3>
            <div className="flex flex-wrap gap-2">
              {integrationStatus.permissions.map((permission) => (
                <span key={permission} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                  {permission}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPostForm(true)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Post</span>
            </button>
            <button
              onClick={handleFacebookLogout}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2"
            >
              <Unlink className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Facebook className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Facebook Account</h3>
        <p className="text-gray-600 mb-6">
          Connect your Facebook account to upload posts directly to your profile or pages.
        </p>
        <button
          onClick={handleFacebookLogin}
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2 mx-auto"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Link className="w-4 h-4" />
          )}
          <span>Connect Facebook</span>
        </button>
      </div>
    );
  };

  const renderPostForm = () => {
    if (!showPostForm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Post to Facebook</h3>
          
          {/* Account Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Account
            </label>
            <select
              value={selectedAccount?.id || ''}
              onChange={(e) => {
                const account = integrationStatus.pages.find(p => p.id === e.target.value) || 
                               integrationStatus.userProfile;
                setSelectedAccount(account || null);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an account</option>
              {integrationStatus.userProfile && (
                <option value={integrationStatus.userProfile.id}>
                  {integrationStatus.userProfile.name} (Personal)
                </option>
              )}
              {integrationStatus.pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name} (Page)
                </option>
              ))}
            </select>
          </div>

          {/* Message Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={postData.message}
              onChange={(e) => setPostData({ ...postData, message: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's on your mind?"
            />
          </div>

          {/* Privacy Settings */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy
            </label>
            <select
              value={postData.privacy}
              onChange={(e) => setPostData({ ...postData, privacy: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EVERYONE">Public</option>
              <option value="ALL_FRIENDS">Friends</option>
              <option value="FRIENDS_OF_FRIENDS">Friends of Friends</option>
              <option value="SELF">Only Me</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPostForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePostUpload}
              disabled={isLoading || !selectedAccount || !postData.message.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Uploading...' : 'Upload Post'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Facebook className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Facebook Integration</h2>
            <p className="text-sm text-gray-600">Manage your Facebook account connection</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="sr-only">Close</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {isLoading && !integrationStatus.isConnected ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Checking integration status...</p>
          </div>
        ) : (
          renderIntegrationStatus()
        )}

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <h4 className="font-medium mb-1">How it works</h4>
              <ul className="space-y-1">
                <li>• Connect your Facebook account to upload posts directly</li>
                <li>• Choose between your personal profile or business pages</li>
                <li>• Set privacy settings for each post</li>
                <li>• Your data is secure and only used for posting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Post Form Modal */}
      {renderPostForm()}
    </div>
  );
};

export default FacebookIntegrationManager;
