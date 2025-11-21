import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup } from 'firebase/auth';
import { auth, db, facebookProvider } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types/user';
import { storage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  userData: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ user?: User; error?: any }>;
  signUp: (email: string, password: string) => Promise<{ user?: User; error?: any }>;
  signInWithFacebook: () => Promise<{ user?: User; error?: any }>;
  logout: () => Promise<void>;
  updateUserData: (updates: Partial<UserProfile>) => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // check token for auto log out.
  const checkTokenExpiration = async (currentUser: User) => {
    try {
      // Firebase Auth automatically updates the token but verify it
      const token = await currentUser.getIdToken(true);
      if (!token) {
        throw new Error('Invalid token');
      }
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      await logout();
      return false;
    }
  };

  // Check auth status
  const checkAuthStatus = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const isValid = await checkTokenExpiration(user);
      return isValid;
    } catch (error) {
      console.error('Auth status check failed:', error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // verify the valid token
          const isTokenValid = await checkTokenExpiration(currentUser);
          if (!isTokenValid) {
            return;
          }

          const userDocRef = doc(db, 'profiles', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserProfile);
          } else {
            // Create a default profile if none exists
            const defaultProfile: UserProfile = {
              id: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
              username: `@${currentUser.email?.split('@')[0] || 'user'}`,
              email: currentUser.email || '',
              bio: 'Tell us about yourself...',
              location: 'Location',
              website: 'https://example.com',
              industry: 'Technology',
              experienceLevel: 1,
              rating: 4.5,
              following: 0,
              followers: 0,
              profile_image_url: getInitials(currentUser.displayName),
              cover_image_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            await setDoc(userDocRef, defaultProfile);
            setUserData(defaultProfile);
          }
        } catch (error: any) {
          console.error('Error fetching user data:', error);
          
          // Check if it's an offline error
          if (error.code === 'unavailable' || error.message?.includes('offline')) {
            console.warn('Firebase is offline, user data will be loaded when connection is restored');
            // Don't logout on offline errors, just set loading to false
            setIsLoading(false);
            return;
          }
          
          // For other errors, logout the user
          await logout();
        }
      } else {
        setUserData(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check the status of token every 5 min
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const isValid = await checkAuthStatus();
      if (!isValid) {
        console.log('Token expired, logging out...');
        await logout();
      }
    }, 5 * 60 * 1000); // 5 min

    return () => clearInterval(interval);
  }, [user]);

  function getInitials(name?: string | null): string {
    if (!name) return "U"; // fallback for unknown
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user data immediately after sign in
      const userDocRef = doc(db, 'profiles', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserProfile);
      }
      
      return { user: userCredential.user };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Check for expired API key error
      if (error?.code === 'auth/api-key-expired' || 
          error?.message?.includes('api-key-expired') ||
          error?.message?.includes('API key expired')) {
        console.error('❌ Firebase API Key Expired:', {
          message: 'Your Firebase API key has expired. Please update it in your .env file.',
          steps: [
            '1. Go to Firebase Console: https://console.firebase.google.com/project/mr-gyb-ai-app-108/settings/general',
            '2. Copy the new API key from "Your apps" section',
            '3. Update VITE_FIREBASE_API_KEY in project/.env file',
            '4. Restart your development server (npm run dev)'
          ],
          help: 'See FIREBASE_API_KEY_FIX.md for detailed instructions'
        });
      }
      
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signInWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      
      // Check if this is a new user by checking if profile exists
      const userDocRef = doc(db, 'profiles', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create a new profile for Facebook user
        const defaultProfile: UserProfile = {
          id: result.user.uid,
          name: result.user.displayName || result.user.email?.split('@')[0] || 'Facebook User',
          username: `@${result.user.displayName?.toLowerCase().replace(/\s+/g, '') || 'facebookuser'}`,
          email: result.user.email || '',
          bio: 'Tell us about yourself...',
          location: 'Location',
          website: 'https://example.com',
          industry: 'Technology',
          experienceLevel: 1,
          rating: 4.5,
          following: 0,
          followers: 0,
          profile_image_url: result.user.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
          cover_image_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          authProvider: 'facebook'
        };
        
        await setDoc(userDocRef, defaultProfile);
        setUserData(defaultProfile);
      }
      
      return { user: result.user };
    } catch (error) {
      console.error('Facebook sign in error:', error);
      return { error };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      // Clear all user-specific data from localStorage to prevent data leakage
      storage.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserData = async (updates: Partial<UserProfile>) => {
    if (!user || !userData) return;
    
    const updatedProfile = {
      ...userData,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'profiles', user.uid), updatedProfile, { merge: true });
    setUserData(updatedProfile);
  };

  const value = {
    user,
    userData,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signInWithFacebook,
    logout,
    updateUserData,
    checkAuthStatus,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-blue"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};