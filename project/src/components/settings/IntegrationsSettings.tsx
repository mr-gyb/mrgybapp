import React, { useState } from 'react';
import { 
  Settings, 
  Facebook, 
  Instagram, 
  Pinterest, 
  Link, 
  Unlink, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Shield,
  Info
} from 'lucide-react';
import FacebookIntegrationManager from '../integrations/FacebookIntegrationManager';

interface IntegrationsSettingsProps {
  onClose: () => void;
}

const IntegrationsSettings: React.FC<IntegrationsSettingsProps> = ({ onClose }) => {
  const [showFacebookIntegration, setShowFacebookIntegration] = useState(false);
  const [integrations] = useState([
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Connect your Facebook account to upload posts directly',
      icon: <Facebook className="w-6 h-6 text-blue-600" />,
      status: 'connected', // 'connected', 'disconnected', 'error'
      lastSync: '2 hours ago'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect your Instagram account for content management',
      icon: <Instagram className="w-6 h-6 text-pink-500" />,
      status: 'disconnected',
      lastSync: null
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      description: 'Connect your Pinterest account for pin management',
      icon: <Pinterest className="w-6 h-6 text-red-600" />,
      status: 'disconnected',
      lastSync: null
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Unlink className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      default:
        return 'Not Connected';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleIntegrationClick = (integration: any) => {
    if (integration.id === 'facebook') {
      setShowFacebookIntegration(true);
    }
    // Add other integrations as needed
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-600">Manage your account and integrations</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="sr-only">Close</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Breadcrumb */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <button
            onClick={onClose}
            className="hover:text-gray-900 transition-colors"
          >
            Settings
          </button>
          <span>→</span>
          <span className="text-gray-900 font-medium">Manage Integration</span>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Social Media Integrations</h3>
          <p className="text-gray-600">
            Connect your social media accounts to upload content directly and manage your posts.
          </p>
        </div>

        {/* Integrations List */}
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleIntegrationClick(integration)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {integration.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{integration.name}</h4>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                    {integration.lastSync && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last synced: {integration.lastSync}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(integration.status)}`}>
                    {getStatusIcon(integration.status)}
                    <span className="ml-1">{getStatusText(integration.status)}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <h4 className="font-medium mb-2">About Integrations</h4>
              <ul className="space-y-1">
                <li>• Connect your social media accounts to upload content directly</li>
                <li>• Manage posts, schedule content, and track performance</li>
                <li>• Your data is secure and only used for the intended purpose</li>
                <li>• You can disconnect any integration at any time</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <h4 className="font-medium mb-1">Security & Privacy</h4>
              <p>
                We use industry-standard security measures to protect your data. 
                Your social media credentials are never stored on our servers. 
                We only request the minimum permissions needed for functionality.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Facebook Integration Modal */}
      {showFacebookIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <FacebookIntegrationManager
            onClose={() => setShowFacebookIntegration(false)}
            onPostUploaded={(result) => {
              console.log('Facebook post uploaded:', result);
              setShowFacebookIntegration(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default IntegrationsSettings;
