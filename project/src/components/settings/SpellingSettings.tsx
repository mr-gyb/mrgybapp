import React, { useState } from 'react';
import SettingsPageTemplate from '../SettingsPageTemplate';
import { Check } from 'lucide-react';

const SpellingSettings: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);

  return (
    <SettingsPageTemplate title="Spelling Settings">
      <div className="bg-gray-100 rounded-lg p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Automatic Spelling Correction</h2>
            <p className="text-gray-600">Automatically correct spelling mistakes as you type</p>
          </div>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${
              isEnabled ? 'bg-navy-blue' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${
                isEnabled ? 'transform translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Features</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check size={16} className="text-green-500 mr-2" />
                Real-time spell checking
              </li>
              <li className="flex items-center">
                <Check size={16} className="text-green-500 mr-2" />
                Grammar suggestions
              </li>
              <li className="flex items-center">
                <Check size={16} className="text-green-500 mr-2" />
                Auto-correction while typing
              </li>
            </ul>
          </div>
        </div>
      </div>
    </SettingsPageTemplate>
  );
};

export default SpellingSettings;