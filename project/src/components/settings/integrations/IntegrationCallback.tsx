import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import youtubeOAuthService from '../../services/youtubeOAuth.service';
import { platformApiService } from '../../api/services/platform-apis.service';

const IntegrationCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');
        const provider = searchParams.get('provider') || 'youtube'; // Default to YouTube
        
        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          setTimeout(() => {
            navigate('/settings/integrations');
          }, 3000);
          return;
        }

        if (code) {
          // Check if this is a YouTube OAuth callback
          // YouTube OAuth uses Google OAuth, so check for the yt-analytics scope in the URL or state
          const isYouTube = provider === 'youtube' || 
                           window.location.href.includes('youtube') ||
                           sessionStorage.getItem('oauth_provider') === 'youtube' ||
                           searchParams.get('scope')?.includes('yt-analytics');
          
          // Handle YouTube OAuth specifically
          if (isYouTube) {
            setMessage('Exchanging authorization code for access token...');
            
            try {
              // Verify state for security
              if (state && !youtubeOAuthService.verifyState(state)) {
                throw new Error('Invalid state parameter. Possible CSRF attack.');
              }

              await youtubeOAuthService.exchangeCodeForToken(code);
              // Reload platform service configs to pick up the new token
              platformApiService.reloadConfigs();
              setStatus('success');
              setMessage('YouTube authentication successful! Redirecting...');
              
              setTimeout(() => {
                navigate('/settings/integrations');
              }, 2000);
            } catch (error: any) {
              console.error('YouTube token exchange error:', error);
              setStatus('error');
              setMessage(error.message || 'Failed to exchange authorization code. You may need to set up a backend server or use manual token entry.');
              
              // Show instructions for manual setup
              setTimeout(() => {
                navigate('/settings/integrations?youtube_error=token_exchange_failed');
              }, 5000);
            }
          } else {
            // For other providers, just show success (they handle their own token exchange)
            setStatus('success');
            setMessage('Authentication successful! Redirecting...');
            
            setTimeout(() => {
              navigate('/settings/integrations');
            }, 2000);
          }
        } else {
          setStatus('error');
          setMessage('No authorization code received');
          setTimeout(() => {
            navigate('/settings/integrations');
          }, 3000);
        }
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
        setTimeout(() => {
          navigate('/settings/integrations');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing...</h2>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            </>
          )}
          
          <p className="text-gray-600">{message}</p>
          
          <button
            onClick={() => navigate('/settings/integrations')}
            className="mt-4 bg-navy-blue text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition-colors"
          >
            Back to Integrations
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationCallback;
