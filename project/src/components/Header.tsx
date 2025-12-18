import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import SideMenu from './SideMenu';
import { getProfile } from '../lib/firebase/profile';
import { UserProfile } from '../types/user';
import { useChat } from '../contexts/ChatContext';
import { Bell, Menu } from 'lucide-react';

interface HeaderProps {
  getPageTitle: (pathname: string) => string;
}

const Header: React.FC<HeaderProps> = ({ getPageTitle }) => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentChatId } = useChat();
  const isHome = location.pathname === '/home';

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setIsLoading(true);
        const profile = await getProfile(user.uid);
        if (profile) {
          setProfileData(profile);
        }
        setIsLoading(false);
      }
    };

    loadProfile();

    const handleProfileUpdated = () => {
      loadProfile();
    };


    window.addEventListener('profileUpdated', handleProfileUpdated);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdated);
    };

  }, [user]);

  const handleLogoClick = () => {
    navigate(`/chat/${currentChatId}`, { state: { selectedAgent: 'Mr.GYB AI' } });
  };

  const handleTitleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    navigate(location.pathname, { replace: true });
  };

  const getExperienceColor = (level: number) => {
    switch (level) {
      case 1: return 'border-red-500';
      case 2: return 'border-orange-500';
      case 3: return 'border-blue-500';
      case 4: return 'border-green-500';
      case 5: return 'border-yellow-400';
      default: return 'border-gray-300';
    }
  };

  const initials = profileData?.name
    ? profileData.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'JD';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-10 bg-[#11335d] shadow-sm">
        <div className="w-full flex items-center justify-between px-4 py-2.5">
          {/* Left cluster: app grid, menu, brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSideMenuOpen(true)}
              className="w-9 h-9 rounded-full bg-[#E3C472] border border-[#E3C472] flex items-center justify-center text-[#11335d] hover:opacity-90 transition-opacity"
            >
              <Menu size={18} />
            </button>

            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 group"
            >
              <img
                src="/GYBlogo.webp"
                alt="Grow Your Business"
                className="h-7 w-auto object-contain"
              />
              <span className="text-sm font-medium tracking-wide text-gray-100">
                <span>Grow Your </span>
                <span className="text-[#E3C472]">Business</span>
              </span>
            </button>
          </div>

          {/* Right cluster: bell (except on home) + user pill */}
          <div className="flex items-center gap-4">
            {!isHome && (
              <button className="relative text-gray-300 hover:text-white transition-colors">
                <Bell size={18} />
                <span className="absolute -top-1 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#facc15]" />
              </button>
            )}

            <button
              onClick={() => setIsSideMenuOpen(true)}
              className="w-9 h-9 rounded-full bg-[#E3C472] flex items-center justify-center border border-[#E3C472] text-xs font-semibold text-[#11335d]"
            >
              {initials}
            </button>
          </div>
        </div>
      </header>

      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        userData={profileData || undefined}
      />
    </>
  );
};

export default Header;