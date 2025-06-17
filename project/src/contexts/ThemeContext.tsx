import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThemePreference = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const userDoc = await getDoc(doc(db, 'profiles', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.darkMode) {
              setIsDarkMode(true);
            }
          }
        } catch (error) {
          console.error('Error loading theme preference:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // If no user, check localStorage
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode) {
          setIsDarkMode(JSON.parse(savedMode));
        }
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, [user]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      localStorage.setItem('darkMode', JSON.stringify(newMode));

      if (user) {
        await updateDoc(doc(db, 'profiles', user.uid), {
          darkMode: newMode,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to update theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};