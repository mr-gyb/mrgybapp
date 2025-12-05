import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import youtubeOAuthService from '../../../services/youtubeOAuth.service';
import { platformApiService } from '../../../api/services/platform-apis.service';

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
          // Determine which provider this callback is for
          const oauthProvider = sessionStorage.getItem('oauth_provider') || provider;
          const isYouTube = oauthProvider === 'youtube' || 
                           window.location.href.includes('youtube') ||
                           searchParams.get('scope')?.includes('yt-analytics');
          const isInstagram = oauthProvider === 'instagram' || 
                             window.location.href.includes('instagram');
          const isFacebook = oauthProvider === 'facebook' || 
                           (!isYouTube && !isInstagram && window.location.href.includes('facebook'));
          
          // Handle YouTube OAuth specifically
          if (isYouTube) {
            setMessage('Exchanging authorization code for access token...');
            
            try {
              // Verify state for security
              if (state && !youtubeOAuthService.verifyState(state)) {
                throw new Error('Invalid state parameter. Possible CSRF attack.');
              }

              // Exchange code for token via backend
              const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.replace('/api', '') || 'http://localhost:8080';
              const tokenResponse = await fetch(`${backendUrl}/api/youtube/callback?code=${code}&state=${state || ''}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              if (!tokenResponse.ok) {
                const errorData = await tokenResponse.json();
                throw new Error(errorData.error || 'Failed to exchange authorization code');
              }

              const tokenData = await tokenResponse.json();
              
              // Save tokens to localStorage
              if (tokenData.tokens?.access_token) {
                localStorage.setItem('youtube_oauth_token', tokenData.tokens.access_token);
                if (tokenData.tokens.refresh_token) {
                  localStorage.setItem('youtube_refresh_token', tokenData.tokens.refresh_token);
                }
                if (tokenData.tokens.expiry_date) {
                  const expiryTime = tokenData.tokens.expiry_date;
                  localStorage.setItem('youtube_token_expiry', expiryTime.toString());
                }
              }

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
          } else if (isInstagram || isFacebook) {
            // Handle Instagram/Facebook OAuth
            // The backend callback now redirects here with success=true, so we fetch tokens from session
            setMessage('Retrieving access tokens...');
            
            try {
              const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.replace('/api', '') || 'http://localhost:8080';
              const tokenEndpoint = isInstagram 
                ? '/api/instagram/auth/tokens'
                : '/api/facebook/auth/tokens';
              
              // Check if we have success parameter (backend redirected here)
              const success = searchParams.get('success');
              if (success === 'true') {
                // Fetch tokens from backend session
                const tokenResponse = await fetch(`${backendUrl}${tokenEndpoint}`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include', // Include cookies for session
                });

                if (!tokenResponse.ok) {
                  const errorData = await tokenResponse.json();
                  throw new Error(errorData.error || 'Failed to retrieve tokens from session');
                }

                const tokenData = await tokenResponse.json();
                
                // Save tokens to localStorage
                if (tokenData.tokens?.access_token) {
                  localStorage.setItem('facebook_long_lived_token', tokenData.tokens.access_token);
                  if (tokenData.tokens.pageId) {
                    localStorage.setItem('facebook_page_id', tokenData.tokens.pageId);
                  }
                  if (tokenData.tokens.instagramBusinessAccountId) {
                    localStorage.setItem('instagram_business_account_id', tokenData.tokens.instagramBusinessAccountId);
                  }
                  
                  // Also store for Facebook integration service
                  localStorage.setItem('facebook_access_token', tokenData.tokens.access_token);
                }

                // Reload platform service configs
                platformApiService.reloadConfigs();
                setStatus('success');
                setMessage(`${isInstagram ? 'Instagram' : 'Facebook'} authentication successful! Redirecting...`);
                
                setTimeout(() => {
                  navigate('/settings/integrations');
                }, 2000);
              } else {
                // Fallback: try direct callback (for backward compatibility)
                const callbackEndpoint = isInstagram 
                  ? '/api/instagram/auth/callback'
                  : '/api/facebook/auth/callback';
                
                const tokenResponse = await fetch(`${backendUrl}${callbackEndpoint}?code=${code}&state=${state || ''}`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });

                if (!tokenResponse.ok) {
                  const errorData = await tokenResponse.json();
                  throw new Error(errorData.error || 'Failed to exchange authorization code');
                }

                const tokenData = await tokenResponse.json();
                
                // Save tokens to localStorage
                if (tokenData.tokens?.access_token) {
                  localStorage.setItem('facebook_long_lived_token', tokenData.tokens.access_token);
                  if (tokenData.pageId) {
                    localStorage.setItem('facebook_page_id', tokenData.pageId);
                  }
                  if (tokenData.instagramBusinessAccountId) {
                    localStorage.setItem('instagram_business_account_id', tokenData.instagramBusinessAccountId);
                  }
                  
                  // Also store for Facebook integration service
                  localStorage.setItem('facebook_access_token', tokenData.tokens.access_token);
                }

                // Reload platform service configs
                platformApiService.reloadConfigs();
                setStatus('success');
                setMessage(`${isInstagram ? 'Instagram' : 'Facebook'} authentication successful! Redirecting...`);
                
                setTimeout(() => {
                  navigate('/settings/integrations');
                }, 2000);
              }
            } catch (error: any) {
              console.error(`${isInstagram ? 'Instagram' : 'Facebook'} token exchange error:`, error);
              setStatus('error');
              setMessage(error.message || 'Failed to exchange authorization code.');
              
              setTimeout(() => {
                navigate('/settings/integrations');
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
