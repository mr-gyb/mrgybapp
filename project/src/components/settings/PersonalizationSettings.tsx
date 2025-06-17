import React, { useState } from 'react';
import { ChevronRight, Bot, Settings, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import SettingsPageTemplate from '../SettingsPageTemplate';

const PersonalizationSettings: React.FC = () => {
  const { userData, updateUserData } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isCustomizeOn, setIsCustomizeOn] = useState(userData?.customizeEnabled || false);
  const [isMemoryOn, setIsMemoryOn] = useState(userData?.memoryEnabled || false);

  const handleCustomizeToggle = () => {
    setIsCustomizeOn(!isCustomizeOn);
    updateUserData?.({ customizeEnabled: !isCustomizeOn });
  };

  const handleMemoryToggle = () => {
    setIsMemoryOn(!isMemoryOn);
    updateUserData?.({ memoryEnabled: !isMemoryOn });
  };

  return (
    <SettingsPageTemplate title="Personalization">
      <div className="space-y-6">
        <div className="bg-white dark:bg-navy-blue rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                <Bot size={16} className="text-navy-blue dark:text-white" />
              </div>
              <span className="text-navy-blue dark:text-white text-lg font-semibold">Customize AI</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-300">{isCustomizeOn ? 'On' : 'Off'}</span>
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

        <div className="bg-white dark:bg-navy-blue rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isDarkMode ? (
                <Moon size={20} className="text-gold" />
              ) : (
                <Sun size={20} className="text-gold" />
              )}
              <span className="text-navy-blue dark:text-white text-lg font-semibold">
                Dark Mode
              </span>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${
                isDarkMode ? 'bg-gold' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${
                  isDarkMode ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-navy-blue dark:text-white">Memory & Learning</h2>

        <div className="bg-white dark:bg-navy-blue rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-navy-blue dark:text-white text-lg font-semibold">Memory</span>
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

        <div className="text-gray-700 dark:text-gray-300 space-y-4">
          <p>
            AI will become more helpful as you chat, picking up on details and preferences to
            tailor its responses to you. <Link to="/help/memory" className="text-navy-blue dark:text-gold hover:underline">Learn more</Link>
          </p>
          <p>To understand what AI remembers or teach it something new, just chat with it:</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>"Remember that I like concise responses."</li>
            <li>"I just started a new project!"</li>
            <li>"What do you remember about me?"</li>
            <li>"Where did we leave off on my last project?"</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-navy-blue rounded-lg p-4 shadow-md">
          <Link to="/settings/memory" className="flex items-center justify-between">
            <span className="text-navy-blue dark:text-white text-lg font-semibold">Manage Memory</span>
            <ChevronRight className="text-gray-400" size={20} />
          </Link>
        </div>
      </div>
    </SettingsPageTemplate>
  );
};

export default PersonalizationSettings;