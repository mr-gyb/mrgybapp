import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Plus, LayoutDashboard, Map } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '../contexts/ChatContext';
import CultureIcon from './icons/CultureIcon';

const BottomMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { currentChatId, createNewChat } = useChat();

  const handleChatNavigation = async () => {
    if (!currentChatId) {
      const newChatId = await createNewChat();
      if (newChatId) {
        navigate(`/chat/${newChatId}`);
      } else {
        navigate('/new-chat');
      }
    } else {
      navigate(`/chat/${currentChatId}`);
    }
  };

  const menuItems = [
    {
      path: '/homepage',
      icon: Home,
      label: 'Home',
      isCustomNav: false
    },
    { 
      path: '/new-chat', 
      icon: CultureIcon, // Use CultureIcon here
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
      path: '/gyb-live-network', 
      icon: Users, 
      label: 'Community',
      isCustomNav: false 
    },
    { 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      label: 'Commerce',
      isCustomNav: false 
    },
    { 
      path: '/road-map', 
      icon: Map, 
      label: 'Roadmap',
      isCustomNav: false 
    }
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-navy-blue border-t border-gray-200 dark:border-gray-700 z-50 transition-colors duration-200`}>
      <div className="flex justify-around items-center h-16">
        {menuItems.map((item, idx) => (
          item.isCustomNav ? (
            <button
              key={item.path}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center w-full h-full ${
                location.pathname === item.path 
                  ? 'text-navy-blue dark:text-gold' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {/* Use size=34 for CultureIcon, 26 for others */}
              {item.label === 'Culture' ? <item.icon size={36} /> : <item.icon size={26} />}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.path}
              to={item.path === '/new-post' ? '/gyb-studio' : item.path}
              className={`flex flex-col items-center justify-center w-full h-full ${
                location.pathname === item.path 
                  ? 'text-navy-blue dark:text-gold' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <item.icon size={26} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        ))}
      </div>
    </nav>
  );
};

export default BottomMenu;