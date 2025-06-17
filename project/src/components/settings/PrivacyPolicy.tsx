import React from 'react';
import SettingsPageTemplate from '../SettingsPageTemplate';
import { Lock } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <SettingsPageTemplate title="Privacy Policy">
      <div className="bg-gray-100 rounded-lg p-6 shadow-md">
        <div className="flex items-center mb-6">
          <Lock size={24} className="text-navy-blue mr-3" />
          <h2 className="text-xl font-bold">Privacy Policy</h2>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-600">
            Last updated: January 1, 2024
          </p>
          
          <div className="mt-6 space-y-4">
            <p>
              Your privacy is important to us. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information.
            </p>
            
            <h3 className="text-lg font-semibold">1. Information Collection</h3>
            <p>
              We collect information that you provide directly to us when using our platform.
            </p>

            <h3 className="text-lg font-semibold">2. Use of Information</h3>
            <p>
              We use the information we collect to provide, maintain, and improve our services,
              to develop new ones, and to protect our platform and our users.
            </p>
          </div>
        </div>
      </div>
    </SettingsPageTemplate>
  );
};

export default PrivacyPolicy;