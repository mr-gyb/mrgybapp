import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import BottomMenu from './BottomMenu';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
// import { useChat } from '../contexts/ChatContext'; // Removed useChat import

interface MainLayoutProps {
  children: React.ReactNode;
  getPageTitle: (pathname: string) => string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, getPageTitle }) => {
  const { isDarkMode } = useTheme(); // Removed isLoading: isThemeLoading
  const location = useLocation();
  const showHeaderAndMenu = location.pathname !== '/' && location.pathname !== '/login';
  const isHome = location.pathname === '/home';
  const showBottomMenu = showHeaderAndMenu;

  // Removed conditional loading spinner
  // if (isThemeLoading || isAuthLoading || isChatLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-white">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-blue"></div>
  //     </div>
  //   );
  // }

  const baseClasses = isHome
    ? 'bg-[#020617] text-white'
    : isDarkMode
      ? 'dark bg-navy-blue text-white'
      : 'bg-white text-navy-blue';

  return (
    <div className={`flex flex-col min-h-screen ${baseClasses}`}>
      {showHeaderAndMenu && <Header getPageTitle={getPageTitle} />}
      <main className={`flex-grow ${showHeaderAndMenu ? 'mt-16 mb-16' : ''}`}>
        {children}
      </main>
      {showBottomMenu && <BottomMenu />}
    </div>
  );
};

export default MainLayout;
