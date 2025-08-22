import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Facebook, CheckCircle, XCircle, Loader } from 'lucide-react';
import { facebookIntegrationService } from '../services/facebookIntegration.service';

const FacebookCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Facebook authentication...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      setStatus('loading');
      setMessage('Processing Facebook authentication...');

      // Check if we have an error from Facebook
      const error = searchParams.get('error');
      const errorReason = searchParams.get('error_reason');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        console.error('Facebook authentication error:', { error, errorReason, errorDescription });
        setStatus('error');
        setMessage(`Authentication failed: ${errorDescription || errorReason || error}`);
        
        // Redirect back to integrations after 3 seconds
        setTimeout(() => {
          navigate('/settings/integrations');
        }, 3000);
        return;
      }

      // Check if we have an authorization code
      const code = searchParams.get('code');
      if (!code) {
        setStatus('error');
        setMessage('No authorization code received from Facebook');
        
        setTimeout(() => {
          navigate('/settings/integrations');
        }, 3000);
        return;
      }

      // Process the authorization code
      setMessage('Exchanging authorization code for access token...');
      
      // Initialize Facebook SDK and check login status
      await facebookIntegrationService.initializeFacebookSDK();
      const loginStatus = await facebookIntegrationService.getLoginStatus();
      
      if (loginStatus.status === 'connected') {
        setStatus('success');
        setMessage('Successfully connected to Facebook!');
        
        // Redirect to Facebook integration page after 2 seconds
        setTimeout(() => {
          navigate('/settings/integrations/facebook');
        }, 2000);
      } else {
        setStatus('error');
        setMessage('Failed to complete Facebook authentication. Please try again.');
        
        setTimeout(() => {
          navigate('/settings/integrations');
        }, 3000);
      }

    } catch (error) {
      console.error('Error handling Facebook callback:', error);
      setStatus('error');
      setMessage(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      setTimeout(() => {
        navigate('/settings/integrations');
      }, 3000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="h-12 w-12 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-600" />;
      default:
        return <Loader className="h-12 w-12 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Facebook Icon */}
          <div className="mb-6">
            <Facebook className="h-16 w-16 text-blue-600 mx-auto" />
          </div>

          {/* Status Icon */}
          <div className="mb-6">
            {getStatusIcon()}
          </div>

          {/* Status Message */}
          <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
            {status === 'loading' && 'Connecting to Facebook...'}
            {status === 'success' && 'Successfully Connected!'}
            {status === 'error' && 'Connection Failed'}
          </h1>

          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Progress Bar for Loading */}
          {status === 'loading' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'error' && (
              <button
                onClick={() => navigate('/settings/integrations')}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Integrations
              </button>
            )}
            
            {status === 'success' && (
              <button
                onClick={() => navigate('/settings/integrations/facebook')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Facebook Integration
              </button>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-xs text-gray-500">
            <p>You will be redirected automatically...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookCallback;
