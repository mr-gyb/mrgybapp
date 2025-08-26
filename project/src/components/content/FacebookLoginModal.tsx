import React, { useState } from 'react';
import { X, ArrowLeft, Facebook, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFacebookIntegration } from '../../hooks/useFacebookIntegration';

interface FacebookLoginModalProps {
  onClose: () => void;
  onBack: () => void;
  onSuccess: (account: any) => void;
}

const FacebookLoginModal: React.FC<FacebookLoginModalProps> = ({
  onClose,
  onBack,
  onSuccess
}) => {
  const { signInWithFacebook } = useAuth();
  const { 
    connectedAccount, 
    isLoading, 
    error, 
    connectAccount, 
    disconnectAccount, 
    clearError 
  } = useFacebookIntegration();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFacebookLogin = async () => {
    try {
      setIsConnecting(true);
      clearError();

      // Check if Firebase is properly configured
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      };

      if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
        throw new Error('Firebase configuration is missing. Please check your environment variables.');
      }

      // First, authenticate with Firebase using Facebook
      const result = await signInWithFacebook();
      if (result.error) {
        throw new Error('Facebook authentication failed');
      }

      // Get the Facebook access token from the user credential
      const user = result.user;
      if (!user) {
        throw new Error('No user returned from authentication');
      }

      // For demonstration purposes, we'll create a mock connection
      // In production, you'd get the actual Facebook access token from the auth result
      const mockToken = 'mock_token_' + Date.now();
      
      // Connect the account using the hook
      await connectAccount(mockToken);
      
      // Show success state
      setShowSuccess(true);
      
      // Auto-close after 2 seconds and call onSuccess
      setTimeout(() => {
        onSuccess(connectedAccount);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Facebook login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectAccount();
      setShowSuccess(false);
    } catch (error) {
      console.error('Error disconnecting Facebook account:', error);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Connected Successfully!</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Facebook Account Connected
            </h3>
            <p className="text-gray-600 mb-6">
              You can now upload posts directly to your Facebook account from GYB Studio.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <h4 className="font-medium mb-1">What's Next?</h4>
                  <ul className="space-y-1 text-left">
                    <li>• Upload images, videos, or text posts</li>
                    <li>• Schedule posts for optimal timing</li>
                    <li>• Track performance and engagement</li>
                    <li>• Manage multiple Facebook pages</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDisconnect}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Disconnect
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-navy-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Connect Facebook</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
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

          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Facebook className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connect Your Facebook Account
            </h3>
            <p className="text-gray-600">
              Link your Facebook account to upload posts directly from GYB Studio
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleFacebookLogin}
              disabled={isConnecting || isLoading}
              className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-lg py-3 px-4 font-semibold flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Facebook className="w-5 h-5 mr-2" />
              {isConnecting ? 'Connecting...' : 'Continue with Facebook'}
            </button>

            {/* Development Fallback Button */}
            <button
              onClick={() => {
                // For development/testing purposes - simulate successful connection
                setShowSuccess(true);
                setTimeout(() => {
                  onSuccess({ id: 'dev-account', name: 'Development Account' });
                  onClose();
                }, 2000);
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-lg py-3 px-4 font-semibold flex items-center justify-center transition-colors mt-2"
            >
              🧪 Development Mode - Simulate Connection
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <h4 className="font-medium mb-1">What you'll be able to do:</h4>
                  <ul className="space-y-1">
                    <li>• Upload posts to your personal Facebook profile</li>
                    <li>• Post to your business pages (if you have any)</li>
                    <li>• Schedule posts for optimal timing</li>
                    <li>• Track post performance and engagement</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Privacy & Security:</p>
                <p>We only request the permissions needed to post content. Your personal data remains private and secure.</p>
              </div>
            </div>

            {/* Development Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">⚠️ Development Note:</p>
                <p>If Facebook login isn't working, you may need to:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Set up Firebase environment variables</li>
                  <li>Configure Facebook App in Firebase Console</li>
                  <li>Enable Facebook Authentication in Firebase</li>
                </ul>
                <p className="mt-2">Use the "Development Mode" button below to test the UI flow.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookLoginModal;
