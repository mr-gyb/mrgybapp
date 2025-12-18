import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, User, Settings, LogOut, Video, Bookmark, Palette, Moon, Sun, Map, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from "../contexts/ChatContext";
import { isNewUser } from '../utils/userUtils';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: {
    name?: string;
    email?: string;
  };
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, userData }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { setSelectedAgent } = useChat();
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await logout();
      setSelectedAgent(null);
      navigate('/login');
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRoadmapClick = () => {
    navigate('/roadmap');
    onClose();
  };

  // Conditionally render the menu content based on isAuthenticated
  if (!isAuthenticated) {
    return null; // Return null if not authenticated, after all hooks are called
  }

  return (
    <div
      ref={menuRef}
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-navy-blue text-navy-blue dark:text-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col overflow-y-auto shadow-lg`}
    >
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Menu</h2>
          <button onClick={onClose} className="text-navy-blue dark:text-white hover:opacity-80">
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-6">
          <div className="space-y-2">
            <Link
              to="/profile"
              className="flex items-center py-2 hover:text-gold transition-colors"
              onClick={onClose}
            >
              <User size={20} className="mr-2" />
              My Profile
            </Link>
            <Link
              to="/ai-video-avatar"
              className="flex items-center py-2 hover:text-gold transition-colors"
              onClick={onClose}
            >
              <Video size={20} className="mr-2" />
              AI Video Avatar
            </Link>
            <Link
              to="/bookmarks"
              className="flex items-center py-2 hover:text-gold transition-colors"
              onClick={onClose}
            >
              <Bookmark size={20} className="mr-2" />
              Bookmarks
            </Link>
            <Link
              to="/gyb-studio"
              className="flex items-center py-2 hover:text-gold transition-colors"
              onClick={onClose}
            >
              <Palette size={20} className="mr-2" />
              GYB Studio
            </Link>
            <Link
              to="/settings"
              className="flex items-center py-2 hover:text-gold transition-colors"
              onClick={onClose}
            >
              <Settings size={20} className="mr-2" />
              Settings
            </Link>
            <button
              onClick={handleRoadmapClick}
              className="flex items-center py-2 hover:text-gold transition-colors w-full text-left"
            >
              <Map size={20} className="mr-2" />
              Roadmap
            </button>
            <Link
              to="/commerce"
              className="flex items-center py-2 hover:text-gold transition-colors"
              onClick={onClose}
            >
              <LayoutDashboard size={20} className="mr-2" />
              Commerce
            </Link>
            <button
              onClick={() => {
                toggleDarkMode();
              }}
              className="flex items-center py-2 w-full text-left hover:text-gold transition-colors"
            >
              {isDarkMode ? (
                <Sun size={20} className="mr-2" />
              ) : (
                <Moon size={20} className="mr-2" />
              )}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center py-2 text-red-500 hover:text-red-600 w-full"
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default SideMenu;