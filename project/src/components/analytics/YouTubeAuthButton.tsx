import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, ExternalLink, Key } from 'lucide-react';
import youtubeOAuthService from '../../services/youtubeOAuth.service';
import { platformApiService } from '../../api/services/platform-apis.service';

interface YouTubeAuthButtonProps {
  onAuthSuccess?: () => void;
  className?: string;
}

const YouTubeAuthButton: React.FC<YouTubeAuthButtonProps> = ({ 
  onAuthSuccess,
  className = '' 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const authenticated = youtubeOAuthService.isAuthenticated();
      setIsAuthenticated(!!authenticated);
    } catch (err) {
      console.warn('YouTube auth status check failed:', err);
      setIsAuthenticated(false);
    }
  };

  const handleAuthenticate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authUrl = await youtubeOAuthService.getAuthUrl();
      // Store provider info in sessionStorage for callback
      sessionStorage.setItem('oauth_provider', 'youtube');
      window.location.href = authUrl;
    } catch (error: any) {
      console.error('YouTube OAuth error:', error);
      // Extract meaningful error message
      let errorMessage = 'Failed to initiate authentication';

      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.error) {
        errorMessage = error.error;
      }

      // Provide helpful guidance based on error type
      if (errorMessage.includes('Cannot connect') || errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to backend server. Please ensure the backend is running on port 8080.';
      } else if (errorMessage.includes('OAuth credentials not configured')) {
        errorMessage = 'YouTube OAuth credentials not configured. Please set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in the backend .env file.';
      } else if (errorMessage.includes('Backend server error')) {
        errorMessage = 'Backend server error. Please check backend logs and ensure YouTube OAuth credentials are configured.';
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleManualTokenSubmit = () => {
    if (!manualToken.trim()) {
      setError('Please enter an access token');
      return;
    }

    try {
      youtubeOAuthService.setAccessTokenManually(manualToken.trim());
      // Reload platform service configs to pick up the new token
      platformApiService.reloadConfigs();
      setIsAuthenticated(true);
      setShowManualInput(false);
      setManualToken('');
      setError(null);
      onAuthSuccess?.();
    } catch (error: any) {
      setError(error.message || 'Failed to save token');
    }
  };

  const handleDisconnect = () => {
    youtubeOAuthService.clearTokens();
    setIsAuthenticated(false);
    setError(null);
  };

  if (isAuthenticated) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-800">YouTube Authenticated</p>
              <p className="text-xs text-green-600">You can now access demographics data</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-xs text-red-600 hover:text-red-800 underline"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-yellow-800 mb-1">
            YouTube Authentication Required
          </p>
          <p className="text-xs text-yellow-700 mb-3">
            To view demographics data, you need to authenticate with YouTube Analytics API.
          </p>
          
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={handleAuthenticate}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Redirecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Authenticate with Google
                </>
              )}
            </button>

            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 text-xs py-2"
            >
              <Key className="w-4 h-4" />
              {showManualInput ? 'Hide' : 'Enter Token Manually'}
            </button>

            {showManualInput && (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Paste your access token here"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleManualTokenSubmit}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Save Token
                </button>
                <p className="text-xs text-gray-500">
                  Get your token from{' '}
                  <a
                    href="https://developers.google.com/oauthplayground/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    OAuth 2.0 Playground
                  </a>
                  {' '}or Google Cloud Console
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-yellow-200">
            <p className="text-xs text-yellow-700 font-medium mb-2">Setup Instructions:</p>
            <ol className="text-xs text-yellow-600 space-y-1 list-decimal list-inside">
              <li>Enable YouTube Analytics API in Google Cloud Console</li>
              <li>Create OAuth 2.0 credentials (Client ID & Secret)</li>
              <li>Add redirect URI: {window.location.origin}/settings/integrations/callback</li>
              <li>Click "Authenticate with Google" above</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeAuthButton;