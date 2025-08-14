import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import SideMenu from './SideMenu';
import { getProfile } from '../lib/firebase/profile';
import { UserProfile } from '../types/user';

interface HeaderProps {
  getPageTitle: (pathname: string) => string;
}

const Header: React.FC<HeaderProps> = ({ getPageTitle }) => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

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
    navigate('/new-chat', { state: { selectedAgent: 'Mr.GYB AI' } });
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

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-10 bg-white dark:bg-navy-blue shadow-md transition-colors duration-200`}>
        <div className="container mx-auto flex items-center justify-between p-2 sm:p-4">
          <button
            onClick={() => setIsSideMenuOpen(true)}
            className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
              profileData ? getExperienceColor(profileData.experienceLevel) : 'border-navy-blue dark:border-gold'
            } focus:outline-none focus:ring-2 focus:ring-navy-blue dark:focus:ring-gold transition-colors`}
          >
            <img
              src={profileData?.profile_image_url || 'https://cdn-icons-png.flaticon.com/512/63/63699.png'}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>

          <h1 
            onClick={handleTitleClick}
            className="text-lg sm:text-xl font-bold text-navy-blue dark:text-white cursor-pointer hover:opacity-80 transition-opacity"
          >
            {getPageTitle(location.pathname)}
          </h1>

          <button onClick={handleLogoClick} className="h-8 sm:h-10">
            <img src="/gyb-logo.svg" alt="GYB Logo" className="h-full" />
          </button>
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