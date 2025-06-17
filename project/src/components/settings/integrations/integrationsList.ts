import { IntegrationTile } from '../../../types/settings';

interface IntegrationCategory {
  title: string;
  integrations: IntegrationTile[];
}

export const integrationCategories: IntegrationCategory[] = [
  {
    title: 'CRM & Business Tools',
    integrations: [
      {
        name: 'GYB CRM',
        logo: '/gyb-logo.svg',
        description: 'Connect to GYB CRM to manage your customer relationships and sales pipeline.',
        connectUrl: '#',
      },
      {
        name: 'HubSpot',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/HubSpot_Logo.svg/100px-HubSpot_Logo.svg.png',
        description: 'Integrate with HubSpot for advanced CRM, marketing automation, and sales tools.',
        connectUrl: '#',
      },
      {
        name: 'Salesforce',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/100px-Salesforce.com_logo.svg.png',
        description: 'Connect your Salesforce account to sync customer data, leads, and opportunities.',
        connectUrl: '#',
      },
    ]
  },
  {
    title: 'Social Media',
    integrations: [
      {
        name: 'X (Twitter)',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/X_logo_2023.svg/100px-X_logo_2023.svg.png',
        description: 'Connect your X (formerly Twitter) account to manage your posts and engage with followers.',
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
        name: 'TikTok',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/100px-TikTok_logo.svg.png',
        description: 'Connect your TikTok account to manage your short-form video content and engage with your audience.',
        connectUrl: '#',
      },
    ]
  },
  {
    title: 'Media & Content',
    integrations: [
      {
        name: 'YouTube',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/100px-YouTube_full-color_icon_%282017%29.svg.png',
        description: 'Connect your YouTube channel to manage videos, analyze performance, and engage with your audience.',
        connectUrl: '#',
      },
      {
        name: 'Spotify',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/100px-Spotify_logo_without_text.svg.png',
        description: 'Connect to Spotify to manage your podcast content and analyze listener engagement.',
        connectUrl: '#',
      },
      {
        name: 'Apple Podcasts',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Podcasts_%28iOS%29.svg/100px-Podcasts_%28iOS%29.svg.png',
        description: 'Connect to Apple Podcasts to manage and promote your podcast content.',
        connectUrl: '#',
      },
    ]
  },
  {
    title: 'Automation & Tools',
    integrations: [
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
    ]
  }
];