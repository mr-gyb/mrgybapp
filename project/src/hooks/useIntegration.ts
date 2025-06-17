import { useState, useCallback } from 'react';
import { connectIntegration, disconnectIntegration, getIntegrationStatus } from '../api/integrations';

export function useIntegration(integrationName: string) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'pending'>('disconnected');
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      const success = await connectIntegration(integrationName);
      if (success) {
        setStatus('connected');
      } else {
        throw new Error('Connection failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setStatus('disconnected');
    } finally {
      setIsConnecting(false);
    }
  }, [integrationName]);

  const disconnect = useCallback(async () => {
    try {
      setError(null);
      const success = await disconnectIntegration(integrationName);
      if (success) {
        setStatus('disconnected');
      } else {
        throw new Error('Disconnection failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  }, [integrationName]);

  const checkStatus = useCallback(async () => {
    try {
      setError(null);
      const currentStatus = await getIntegrationStatus(integrationName);
      setStatus(currentStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check status');
    }
  }, [integrationName]);

  return {
    isConnecting,
    status,
    error,
    connect,
    disconnect,
    checkStatus
  };
}