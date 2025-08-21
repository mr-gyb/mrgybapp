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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
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
              profile_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
              cover_image_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            await setDoc(userDocRef, defaultProfile);
            setUserData(defaultProfile);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
    } catch (error) {
      console.error('Sign in error:', error);
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
      
      // Check if this is a new user
      if (result._tokenResponse?.isNewUser) {
        // Create a new profile for Facebook user
        const userDocRef = doc(db, 'profiles', result.user.uid);
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
    await signOut(auth);
    setUserData(null);
    // Clear all user-specific data from localStorage to prevent data leakage
    storage.clear();
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