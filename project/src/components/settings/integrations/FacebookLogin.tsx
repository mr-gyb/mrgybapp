import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFacebookIntegration } from '../../../hooks/useFacebookIntegration';
import { FacebookAccount } from '../../../api/services/facebook-integration.service';
import { Facebook, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface FacebookLoginProps {
  onConnect: (account: FacebookAccount) => void;
  onDisconnect: () => void;
}

const FacebookLogin: React.FC<FacebookLoginProps> = ({ onConnect, onDisconnect }) => {
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

  useEffect(() => {
    if (connectedAccount) {
      onConnect(connectedAccount);
    }
  }, [connectedAccount, onConnect]);

  const handleFacebookLogin = async () => {
    try {
      setIsConnecting(true);
      clearError();

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
      
    } catch (error) {
      console.error('Facebook login error:', error);
      // Error is already set by the hook
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectAccount();
      onDisconnect();
    } catch (error) {
      console.error('Error disconnecting Facebook account:', error);
      // Error is already set by the hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (connectedAccount) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Connected to Facebook
              </h3>
              <p className="text-sm text-green-600">
                {connectedAccount.name}
              </p>
              <p className="text-xs text-green-500">
                Connected {new Date(connectedAccount.connectedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDisconnect}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Disconnect
            </button>
          </div>
        </div>
        
        {connectedAccount.permissions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <p className="text-xs text-green-600 mb-2">Permissions granted:</p>
            <div className="flex flex-wrap gap-1">
              {connectedAccount.permissions.map((permission) => (
                <span
                  key={permission}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Facebook className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Connect Facebook Account
            </h3>
            <p className="text-xs text-blue-600">
              Share your content directly to Facebook
            </p>
          </div>
        </div>

        <button
          onClick={handleFacebookLogin}
          disabled={isConnecting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Facebook className="h-4 w-4" />
              <span>Connect Facebook Account</span>
            </>
          )}
        </button>

        <div className="mt-3 text-xs text-blue-600">
          <p>• Post content directly to your Facebook profile</p>
          <p>• Schedule posts for optimal engagement</p>
          <p>• Track post performance and analytics</p>
        </div>
      </div>
    </div>
  );
};

export default FacebookLogin;
