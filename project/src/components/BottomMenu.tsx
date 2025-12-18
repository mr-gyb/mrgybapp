import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Grid3X3, Users, Plus, Video } from 'lucide-react';
import CultureIcon from './icons/CultureIcon';
import { useTheme } from '../contexts/ThemeContext';

const BottomMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleChatNavigation = async () => {
    // Navigate to group chat for Culture tab
    navigate('/group-chat');
  };

  const menuItems = [
    { 
      path: '/new-chat', 
      icon: CultureIcon, // Use CultureIcon here
      label: 'Culture',
      onClick: handleChatNavigation,
      isCustomNav: true
    },
    {
      path: '/new-post',
      icon: Video,
      label: 'Content',
      isCustomNav: false
    },
    {
      path: '/gyb-live-network',
      icon: Users,
      label: 'Community',
      isCustomNav: false
    }
  ];

  const isActive = (itemPath: string) => {
    if (itemPath === '/home') {
      return location.pathname === '/home';
    }

    if (itemPath === '/new-chat') {
      // Treat both the culture entry point and individual chat screens as active
      return location.pathname === '/new-chat' || location.pathname.startsWith('/chat/');
    }

    if (itemPath === '/new-post') {
      return (
        location.pathname === '/gyb-studio' ||
        location.pathname === '/gyb-studio-welcome' ||
        location.pathname === '/new-post'
      );
    }

    return location.pathname === itemPath;
  };

  return (
  <nav className={`fixed bottom-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-navy-blue' : 'bg-transparent'}`}>
      <div className="max-w-5xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between rounded-3xl bg-[#E3C472] border border-[#11335d] shadow-[0_0_20px_rgba(0,0,0,0.12)] px-6 py-2">
          {menuItems.map((item, idx) => {
            const active = isActive(item.path);

            const commonClasses =
              'flex flex-col items-center justify-center flex-1 min-w-0 text-[11px]';

            if (item.isCustomNav) {
              return (
                <button
                  key={`${item.label}-${idx}`}
                  onClick={item.onClick}
                  className={`${commonClasses} text-[#11335d]`}
                >
                  <div
                    className={`flex items-center justify-center mb-1 ${
                      active
                        ? 'w-9 h-9 rounded-xl bg-white border border-[#11335d] shadow-[0_0_18px_rgba(17,51,93,0.25)]'
                        : 'w-8 h-8 rounded-xl'
                    }`}
                  >
                    {item.label === 'Culture' ? (
                      <img
                        src="/culture-icon.jpg"
                        alt="Culture"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    ) : (
                      item.icon && <item.icon size={18} />
                    )}
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={`${item.label}-${idx}`}
                to={item.path === '/new-post' ? '/gyb-studio-welcome' : item.path}
                className={`${commonClasses} text-[#11335d]`}
              >
                <div
                  className={`flex items-center justify-center mb-1 ${
                    active
                      ? 'w-9 h-9 rounded-xl bg-white border border-[#11335d] shadow-[0_0_18px_rgba(17,51,93,0.25)]'
                      : 'w-8 h-8 rounded-xl'
                  }`}
                >
                  {item.label === 'Culture' ? (
                    <img
                      src="/culture-icon.jpg"
                      alt="Culture"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    item.icon && <item.icon size={18} />
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomMenu;