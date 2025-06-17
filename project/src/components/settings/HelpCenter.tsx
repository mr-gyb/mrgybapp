import React from 'react';
import SettingsPageTemplate from '../SettingsPageTemplate';
import { HelpCircle, Book, MessageCircle, Mail } from 'lucide-react';

const HelpCenter: React.FC = () => {
  return (
    <SettingsPageTemplate title="Help Center">
      <div className="space-y-6">
        <div className="bg-gray-100 rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-6">
            <HelpCircle size={24} className="text-navy-blue mr-3" />
            <h2 className="text-xl font-bold">How can we help?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Book size={20} className="text-navy-blue mr-2" />
                <h3 className="font-semibold">Documentation</h3>
              </div>
              <p className="text-gray-600">Browse our comprehensive guides and tutorials</p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <MessageCircle size={20} className="text-navy-blue mr-2" />
                <h3 className="font-semibold">Community Support</h3>
              </div>
              <p className="text-gray-600">Connect with other users and share experiences</p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Mail size={20} className="text-navy-blue mr-2" />
                <h3 className="font-semibold">Contact Support</h3>
              </div>
              <p className="text-gray-600">Get in touch with our support team</p>
            </div>
          </div>
        </div>
      </div>
    </SettingsPageTemplate>
  );
};

export default HelpCenter;