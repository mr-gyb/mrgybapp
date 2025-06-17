import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface IntegrationTile {
  name: string;
  logo: string;
  description: string;
  connectUrl: string;
}

const integrations: IntegrationTile[] = [
  {
    name: 'GYB CRM',
    logo: '/gyb-logo.svg',
    description: 'Connect to GYB CRM to manage your customer relationships and sales pipeline.',
    connectUrl: '#',
  },
  {
    name: 'Salesforce',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/100px-Salesforce.com_logo.svg.png',
    description: 'Connect your Salesforce account to sync customer data, leads, and opportunities.',
    connectUrl: '#',
  },
  {
    name: 'Omi Hardware',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Arduino_Logo.svg/100px-Arduino_Logo.svg.png',
    description: 'Connect and manage your Omi hardware devices for IoT integration and automation.',
    connectUrl: '#',
  },
  {
    name: 'Google',
    logo: '/google-icon.svg',
    description: 'Connect your Google account to sync your calendar, contacts, and more.',
    connectUrl: '#',
  },
  {
    name: 'Facebook',
    logo: '/facebook-icon.svg',
    description: 'Connect your Facebook account to manage your pages and ads.',
    connectUrl: '#',
  },
  {
    name: 'Instagram',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/100px-Instagram_logo_2016.svg.png',
    description: 'Connect your Instagram account to manage your posts and engage with your audience.',
    connectUrl: '#',
  },
  {
    name: 'LinkedIn',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/100px-LinkedIn_logo_initials.png',
    description: 'Connect your LinkedIn account to manage your professional network and content.',
    connectUrl: '#',
  },
  {
    name: 'Twitter',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/100px-Logo_of_Twitter.svg.png',
    description: 'Connect your Twitter account to manage your tweets and engage with your followers.',
    connectUrl: '#',
  },
  {
    name: 'Make',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Make_Logo.svg/100px-Make_Logo.svg.png',
    description: 'Connect Make (formerly Integromat) to automate your workflows and integrate apps.',
    connectUrl: '#',
  },
  {
    name: 'Zapier',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zapier_logo.svg/100px-Zapier_logo.svg.png',
    description: 'Connect Zapier to automate tasks between your favorite apps and services.',
    connectUrl: '#',
  },
  {
    name: 'TikTok',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/100px-TikTok_logo.svg.png',
    description: 'Connect your TikTok account to manage your short-form video content and engage with your audience.',
    connectUrl: '#',
  },
  {
    name: 'Apple Podcasts',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Podcasts_%28iOS%29.svg/100px-Podcasts_%28iOS%29.svg.png',
    description: 'Connect to Apple Podcasts to manage and promote your podcast content.',
    connectUrl: '#',
  },
];

const Integrations: React.FC = () => {
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
            <div key={integration.name} className="bg-gray-100 rounded-lg p-6 shadow-md">
              <div className="flex items-center mb-4">
                <img src={integration.logo} alt={`${integration.name} logo`} className="w-12 h-12 mr-4 object-contain" />
                <h2 className="text-xl font-semibold">{integration.name}</h2>
              </div>
              <p className="text-gray-600 mb-4">{integration.description}</p>
              <a
                href={integration.connectUrl}
                className="bg-navy-blue text-white px-4 py-2 rounded-full inline-block hover:bg-opacity-90 transition duration-300"
              >
                Connect
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Integrations;