import React, { useState } from 'react';
import { ExternalLink, Copy, CheckCircle } from 'lucide-react';

const YouTubeTokenGenerator: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  const CLIENT_ID = '956684071028-3vm17a0fknfnrvcmrm3baolgtqai1f8l.apps.googleusercontent.com';
  const REDIRECT_URI = `${window.location.origin}/settings/integrations/callback`;
  const SCOPE = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly';

  const handleGenerateToken = () => {
    // Generate OAuth URL
    const state = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('youtube_oauth_state', state);
    sessionStorage.setItem('oauth_provider', 'youtube');
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `response_type=code&` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(SCOPE)}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = authUrl;
  };

  const handleCopyToken = () => {
    if (accessToken) {
      navigator.clipboard.writeText(accessToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Check if we have a token in localStorage
  React.useEffect(() => {
    const token = localStorage.getItem('youtube_oauth_token');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-navy-blue mb-6">
          YouTube Access Token Generator
        </h1>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">How to Get Your Access Token:</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Click the "Generate Access Token" button below</li>
              <li>Sign in with your Google account</li>
              <li>Authorize the application to access YouTube Analytics</li>
              <li>You'll be redirected back and the token will be saved automatically</li>
            </ol>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateToken}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            Generate Access Token via OAuth
          </button>

          {/* Alternative: OAuth Playground */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-700 mb-3">Alternative: Use OAuth 2.0 Playground</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <p className="text-sm text-gray-600">
                If the OAuth flow doesn't work, you can use Google's OAuth 2.0 Playground:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>
                  Go to{' '}
                  <a
                    href="https://developers.google.com/oauthplayground/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    OAuth 2.0 Playground
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Click the gear icon (⚙️) in the top right</li>
                <li>Check "Use your own OAuth credentials"</li>
                <li>Enter your Client ID: <code className="bg-gray-200 px-1 rounded">{CLIENT_ID}</code></li>
                <li>In the left panel, find "YouTube Analytics API v2"</li>
                <li>Select: <code className="bg-gray-200 px-1 rounded">https://www.googleapis.com/auth/yt-analytics.readonly</code></li>
                <li>Also select: <code className="bg-gray-200 px-1 rounded">https://www.googleapis.com/auth/youtube.readonly</code></li>
                <li>Click "Authorize APIs"</li>
                <li>Sign in and authorize</li>
                <li>Click "Exchange authorization code for tokens"</li>
                <li>Copy the "Access token" value</li>
                <li>Paste it in the field below</li>
              </ol>
            </div>
          </div>

          {/* Manual Token Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Enter Access Token Manually:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Paste your access token here"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCopyToken}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Save Token Button */}
          {accessToken && (
            <button
              onClick={() => {
                localStorage.setItem('youtube_oauth_token', accessToken);
                const expiryTime = Date.now() + (3600 * 1000); // 1 hour
                localStorage.setItem('youtube_token_expiry', expiryTime.toString());
                alert('Token saved successfully! You can now use the demographics feature.');
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Save Token to LocalStorage
            </button>
          )}

          {/* Current Token Display */}
          {localStorage.getItem('youtube_oauth_token') && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-800 mb-1">
                ✓ Token is saved in localStorage
              </p>
              <p className="text-xs text-green-600">
                Token: {localStorage.getItem('youtube_oauth_token')?.substring(0, 20)}...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubeTokenGenerator;

