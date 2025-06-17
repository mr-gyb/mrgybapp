import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SettingsPageTemplate from './SettingsPageTemplate';

const PersonalizationSettings: React.FC = () => {
  const { userData, updateUserData } = useAuth();
  const [isCustomizeOn, setIsCustomizeOn] = useState(userData?.customizeEnabled || false);
  const [isMemoryOn, setIsMemoryOn] = useState(userData?.memoryEnabled || false);

  const handleCustomizeToggle = () => {
    setIsCustomizeOn(!isCustomizeOn);
    updateUserData({ customizeEnabled: !isCustomizeOn });
  };

  const handleMemoryToggle = () => {
    setIsMemoryOn(!isMemoryOn);
    updateUserData({ memoryEnabled: !isMemoryOn });
  };

  return (
    <SettingsPageTemplate title="Personalization Settings">
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-200 rounded-md flex items-center justify-center">
                <span className="text-lg">⚙️</span>
              </div>
              <span className="text-navy-blue text-lg font-semibold">Customize ChatGPT</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">{isCustomizeOn ? 'On' : 'Off'}</span>
              <button
                onClick={handleCustomizeToggle}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${
                  isCustomizeOn ? 'bg-navy-blue' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${
                    isCustomizeOn ? 'transform translate-x-6' : ''
                  }`}
                />
              </button>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-navy-blue">Personalization</h2>

        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-navy-blue text-lg font-semibold">Memory</span>
            <button
              onClick={handleMemoryToggle}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${
                isMemoryOn ? 'bg-navy-blue' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${
                  isMemoryOn ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>

        <div className="text-gray-700 space-y-4">
          <p>
            ChatGPT will become more helpful as you chat, picking up on details and preferences to
            tailor its responses to you. <a href="#" className="text-navy-blue hover:underline">Learn more</a>
          </p>
          <p>To understand what ChatGPT remembers or teach it something new, just chat with it:</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>"Remember that I like concise responses."</li>
            <li>"I just got a puppy!"</li>
            <li>"What do you remember about me?"</li>
            <li>"Where did we leave off on my last project?"</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-navy-blue text-lg font-semibold">Manage Memory</span>
            <ChevronRight className="text-gray-400" size={20} />
          </div>
        </div>
      </div>
    </SettingsPageTemplate>
  );
};

export default PersonalizationSettings;