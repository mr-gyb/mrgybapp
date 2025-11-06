import React from 'react';
import { Grid, Newspaper, Map } from 'lucide-react';

type ViewType = 'feed' | 'grid' | 'map';

interface CommunityNavProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  showMap?: boolean;
}

const CommunityNav: React.FC<CommunityNavProps> = ({ 
  activeView, 
  onViewChange,
  showMap = false 
}) => {

  const handleTabClick = (view: ViewType) => {
    if (view === 'map' && !showMap) return;
    onViewChange(view);
  };

  const handleKeyDown = (event: React.KeyboardEvent, view: ViewType) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTabClick(view);
    }
  };

  const tabs = [
    { id: 'feed' as ViewType, label: 'Feed', icon: Newspaper },
    { id: 'grid' as ViewType, label: 'Grid', icon: Grid },
    ...(showMap ? [{ id: 'map' as ViewType, label: 'Map', icon: Map }] : [])
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
      <nav 
        className="flex gap-1" 
        role="tablist" 
        aria-label="Community view tabs"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              onClick={() => handleTabClick(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                border-b-2 border-transparent
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${
                  isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }
                ${!showMap && tab.id === 'map' ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={!showMap && tab.id === 'map'}
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

export default CommunityNav;

