import React from 'react';
import { Sparkles, Users, Compass, Search } from 'lucide-react';

type SecondaryTabType = 'for-you' | 'groups' | 'explore' | 'search';

interface SecondaryTabsProps {
  activeTab: SecondaryTabType;
  onTabChange: (tab: SecondaryTabType) => void;
}

const SecondaryTabs: React.FC<SecondaryTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'for-you' as SecondaryTabType, label: 'For You', icon: Sparkles },
    { id: 'groups' as SecondaryTabType, label: 'Groups', icon: Users },
    { id: 'explore' as SecondaryTabType, label: 'Explore', icon: Compass },
    { id: 'search' as SecondaryTabType, label: 'Search', icon: Search }
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
      <nav className="flex gap-1" role="tablist" aria-label="Secondary tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onTabChange(tab.id);
                }
              }}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors
                border-b-2 border-transparent
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${
                  isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }
                ${tab.id !== 'for-you' ? 'opacity-60 cursor-not-allowed' : ''}
              `}
              disabled={tab.id !== 'for-you'}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SecondaryTabs;




