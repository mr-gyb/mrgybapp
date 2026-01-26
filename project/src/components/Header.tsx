import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import SideMenu from './SideMenu';
import { getProfile } from '../lib/firebase/profile';
import { UserProfile } from '../types/user';
// Chat and icon imports removed — header strip components are removed

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

  // Header actions removed — visual elements on the blue strip were removed per request.

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
      <header className="fixed top-0 left-0 right-0 z-10 bg-[#11335d] shadow-sm min-h-[64px]">
        <div className="w-full flex items-center justify-between px-6 py-3">
          {/* Left cluster removed */}
          <div />

          {/* Right cluster removed */}
          <div />
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