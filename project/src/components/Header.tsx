import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/home';

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const profile = await getProfile(user.uid);
        if (profile) {
          setProfileData(profile);
        }
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
        <div className="w-full flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSideMenuOpen(true)}
              className="w-9 h-9 rounded-full bg-[#E3C472] text-[#11335d] flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="flex items-center gap-2 text-white"
              aria-label="Go to home"
            >
              <img src="/logo.png" alt="GYB" className="w-9 h-9 object-contain" />
              <span className="text-sm md:text-base font-semibold">
                {isHome ? 'Grow Your Business' : getPageTitle(location.pathname)}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-[#E3C472] text-[#11335d] text-xs font-semibold flex items-center justify-center"
            aria-label="Open profile"
          >
            {initials}
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