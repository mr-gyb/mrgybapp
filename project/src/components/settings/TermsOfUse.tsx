import React from 'react';
import SettingsPageTemplate from '../SettingsPageTemplate';
import { FileText } from 'lucide-react';

const TermsOfUse: React.FC = () => {
  return (
    <SettingsPageTemplate title="Terms of Use">
      <div className="bg-gray-100 rounded-lg p-6 shadow-md">
        <div className="flex items-center mb-6">
          <FileText size={24} className="text-navy-blue mr-3" />
          <h2 className="text-xl font-bold">Terms of Use</h2>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-600">
            Last updated: January 1, 2024
          </p>
          
          <div className="mt-6 space-y-4">
            <p>
              Please read these terms of use carefully before using our service.
            </p>
            
            <h3 className="text-lg font-semibold">1. Acceptance of Terms</h3>
            <p>
              By accessing and using this platform, you accept and agree to be bound by the terms
              and provision of this agreement.
            </p>

            <h3 className="text-lg font-semibold">2. Use License</h3>
            <p>
              Permission is granted to temporarily download one copy of the materials
              (information or software) on GYB AI's platform for personal,
              non-commercial transitory viewing only.
            </p>
          </div>
        </div>
      </div>
    </SettingsPageTemplate>
  );
};

export default TermsOfUse;