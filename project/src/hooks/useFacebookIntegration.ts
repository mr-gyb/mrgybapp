import { useState, useEffect, useCallback } from 'react';
import { facebookIntegrationService, FacebookAccount, FacebookPostData, FacebookPostResult } from '../api/services/facebook-integration.service';
import { useAuth } from '../contexts/AuthContext';

export const useFacebookIntegration = () => {
  const { user } = useAuth();
  const [connectedAccount, setConnectedAccount] = useState<FacebookAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check connection status on mount and when user changes
  useEffect(() => {
    if (user?.uid) {
      checkConnectionStatus();
    } else {
      setConnectedAccount(null);
      setIsLoading(false);
    }
  }, [user?.uid]);

  const checkConnectionStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const account = await facebookIntegrationService.getConnectedAccount();
      setConnectedAccount(account);
    } catch (error) {
      console.error('Error checking Facebook connection status:', error);
      setError('Failed to check connection status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectAccount = useCallback(async (accessToken: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const account = await facebookIntegrationService.connectFacebookAccount(accessToken);
      setConnectedAccount(account);
      return account;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect Facebook account';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectAccount = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await facebookIntegrationService.disconnectFacebookAccount();
      setConnectedAccount(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect Facebook account';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadPost = useCallback(async (postData: FacebookPostData): Promise<FacebookPostResult> => {
    try {
      setError(null);
      const result = await facebookIntegrationService.uploadPost(postData);
      
      if (!result.success) {
        setError(result.error || 'Failed to upload post');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw error;
    }
  }, []);

  const getUserPages = useCallback(async (accessToken: string) => {
    try {
      return await facebookIntegrationService.getUserPages(accessToken);
    } catch (error) {
      console.error('Error getting user pages:', error);
      return [];
    }
  }, []);

  const checkPermissions = useCallback(async (accessToken: string) => {
    try {
      return await facebookIntegrationService.checkPermissions(accessToken);
    } catch (error) {
      console.error('Error checking permissions:', error);
      return { canPost: false, permissions: [] };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    connectedAccount,
    isLoading,
    error,
    isConnected: !!connectedAccount,
    connectAccount,
    disconnectAccount,
    uploadPost,
    getUserPages,
    checkPermissions,
    checkConnectionStatus,
    clearError
  };
};
