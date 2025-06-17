import React, { useState } from 'react';
import { getAuthUrl } from '../../../utils/integrationAuth';
import AuthPopup from './AuthPopup';

interface IntegrationCardProps {
  integration: {
    name: string;
    logo: string;
    description: string;
  };
  onConnect: (integrationName: string) => Promise<void>;
  onDisconnect: (integrationName: string) => Promise<void>;
  isConnected: boolean;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onConnect,
  onDisconnect,
  isConnected
}) => {
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    if (isConnected) {
      setIsLoading(true);
      try {
        await onDisconnect(integration.name);
      } catch (error) {
        console.error('Failed to disconnect:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Only show auth popup for OAuth-based integrations
      const oauthProviders = ['google', 'facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'salesforce', 'make', 'zapier'];
      
      if (oauthProviders.includes(integration.name.toLowerCase())) {
        const authUrl = getAuthUrl(integration.name);
        if (authUrl) {
          setShowAuthPopup(true);
          return;
        }
      }
      
      // For non-OAuth integrations or fallback
      setIsLoading(true);
      try {
        await onConnect(integration.name);
      } catch (error) {
        console.error('Failed to connect:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <div className="bg-gray-100 rounded-lg p-6 shadow-md">
        <div className="flex items-center mb-4">
          <img 
            src={integration.logo} 
            alt={`${integration.name} logo`} 
            className="w-12 h-12 mr-4 object-contain"
          />
          <h2 className="text-xl font-semibold">{integration.name}</h2>
        </div>
        <p className="text-gray-600 mb-4">{integration.description}</p>
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-full transition duration-300 ${
            isConnected
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-navy-blue text-white hover:bg-opacity-90'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? 'Processing...' : isConnected ? 'Disconnect' : 'Connect'}
        </button>
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        title={`Connect ${integration.name}`}
        url={getAuthUrl(integration.name)}
      />
    </>
  );
};

export default IntegrationCard;