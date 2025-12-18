import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, Plus, Map } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '../contexts/ChatContext';
import CultureIcon from './icons/CultureIcon';

const BottomMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { currentChatId, createNewChat, setSelectedAgent } = useChat();

  const handleChatNavigation = async () => {
    if (!currentChatId) {
      const newChatId = await createNewChat();
      if (newChatId) {
        navigate(`/chat/${newChatId}`);
      }
    } else {
      navigate(`/chat/${currentChatId}`);
    }
  };

  const menuItems = [
    {
      path: '/new-chat',
      icon: null,
      label: 'Culture',
      onClick: handleChatNavigation,
      isCustomNav: true 
    },
    { 
      path: '/new-post', 
      icon: Plus, 
      label: 'Content',
      isCustomNav: false 
    },
    { 
      path: '/community', 
      icon: Users, 
      label: 'Community',
      isCustomNav: false 
    }
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-navy-blue border-t border-gray-200 dark:border-gray-700 z-50 transition-colors duration-200`}>
      <div className="flex justify-between items-center h-16 px-1">
        {menuItems.map((item, idx) => (
          item.isCustomNav ? (
            <button
              key={`${item.label}-${idx}`}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-0 ${
                (item.path === '/new-post' && location.pathname === '/gyb-studio') || location.pathname === item.path
                  ? 'text-navy-blue dark:text-gold' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="flex items-center justify-center h-8 mb-1">
                  <item.icon size={24} />
                </div>
                <span className="text-xs text-center leading-tight px-1 truncate">{item.label}</span>
              </div>
            </button>
          ) : (
            <Link
              key={`${item.label}-${idx}`}
              to={item.path === '/new-post' ? '/gyb-studio-welcome' : item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-0 ${
                (item.path === '/new-post' && (location.pathname === '/gyb-studio' || location.pathname === '/gyb-studio-welcome')) || location.pathname === item.path
                  ? 'text-navy-blue dark:text-gold' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="flex items-center justify-center h-8 mb-1">
                  <item.icon size={24} />
                </div>
                <span className="text-xs text-center leading-tight px-1 truncate">{item.label}</span>
              </div>
            </Link>
          )
        ))}
      </div>
    </nav>
  );
};

export default BottomMenu;