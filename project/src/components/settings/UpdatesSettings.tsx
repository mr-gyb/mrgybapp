import React from 'react';
import SettingsPageTemplate from '../SettingsPageTemplate';
import { RefreshCw } from 'lucide-react';

const UpdatesSettings: React.FC = () => {
  return (
    <SettingsPageTemplate title="Updates">
      <div className="bg-gray-100 rounded-lg p-6 shadow-md">
        <div className="flex items-center mb-6">
          <RefreshCw size={24} className="text-navy-blue mr-3" />
          <h2 className="text-xl font-bold">Check for Updates</h2>
        </div>
        
        <div className="bg-white rounded-lg p-4 mb-4">
          <p className="text-gray-600">Current Version: 1.0.0</p>
        </div>

        <button className="bg-navy-blue text-white px-4 py-2 rounded-full flex items-center">
          <RefreshCw size={20} className="mr-2" />
          Check for Updates
        </button>
      </div>
    </SettingsPageTemplate>
  );
};

export default UpdatesSettings;