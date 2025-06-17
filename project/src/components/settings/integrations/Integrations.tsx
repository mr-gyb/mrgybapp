import React, { useState, useCallback } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import IntegrationCard from './IntegrationCard';
import { useIntegration } from '../../../hooks/useIntegration';

const integrations = [
  {
    name: 'GYB CRM',
    logo: '/gyb-logo.svg',
    description: 'Connect to GYB CRM to manage your customer relationships and sales pipeline.',
  },
  {
    name: 'Salesforce',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/100px-Salesforce.com_logo.svg.png',
    description: 'Connect your Salesforce account to sync customer data, leads, and opportunities.',
  },
  {
    name: 'Google',
    logo: '/google-icon.svg',
    description: 'Connect your Google account to sync your calendar, contacts, and more.',
  },
  {
    name: 'Facebook',
    logo: '/facebook-icon.svg',
    description: 'Connect your Facebook account to manage your pages and ads.',
  },
  {
    name: 'Instagram',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/100px-Instagram_logo_2016.svg.png',
    description: 'Connect your Instagram account to manage your posts and engage with your audience.',
  },
  {
    name: 'LinkedIn',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/100px-LinkedIn_logo_initials.png',
    description: 'Connect your LinkedIn account to manage your professional network and content.',
  },
  {
    name: 'Twitter',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/100px-Logo_of_Twitter.svg.png',
    description: 'Connect your Twitter account to manage your tweets and engage with your followers.',
  },
  {
    name: 'TikTok',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/100px-TikTok_logo.svg.png',
    description: 'Connect your TikTok account to manage your short-form video content.',
  },
  {
    name: 'Make',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Make_Logo.svg/100px-Make_Logo.svg.png',
    description: 'Connect Make (formerly Integromat) to automate your workflows and integrate apps.',
  },
  {
    name: 'Zapier',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zapier_logo.svg/100px-Zapier_logo.svg.png',
    description: 'Connect Zapier to automate tasks between your favorite apps and services.',
  }
];

const Integrations: React.FC = () => {
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);

  const handleConnect = async (integrationName: string) => {
    try {
      setConnectedIntegrations(prev => [...prev, integrationName]);
    } catch (error) {
      console.error('Failed to connect integration:', error);
    }
  };

  const handleDisconnect = async (integrationName: string) => {
    try {
      setConnectedIntegrations(prev => prev.filter(name => name !== integrationName));
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
    }
  };

  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/settings" className="mr-4 text-navy-blue">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-navy-blue">Integrations</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.name}
              integration={integration}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              isConnected={connectedIntegrations.includes(integration.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Integrations;