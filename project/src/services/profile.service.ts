import { collection, getDocs, doc, getDoc, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { UserProfile, AI_USERS, PLACEHOLDER_USERS } from '../types/user';
import { v4 as uuidv4 } from 'uuid';

export const getAllProfiles = async (): Promise<UserProfile[]> => {
  try {
    // Get real user profiles from Firestore
    const profilesSnapshot = await getDocs(collection(db, 'profiles'));
    const profiles = profilesSnapshot.docs.map(doc => doc.data() as UserProfile);
    
    // Combine with AI and placeholder users
    return [...profiles, ...Object.values(AI_USERS), ...Object.values(PLACEHOLDER_USERS)];
  } catch (error) {
    console.error('Error getting profiles:', error);
    // Return only AI and placeholder users as fallback
    return [...Object.values(AI_USERS), ...Object.values(PLACEHOLDER_USERS)];
  }
};

export const createProfile = async (userId: string, profile: Partial<UserProfile>) => {
  try {
    const newProfile: UserProfile = {
      id: userId,
      name: profile.name || '',
      username: profile.username || '',
      email: profile.email || '',
      bio: profile.bio || 'Tell us about yourself...',
      location: profile.location || 'Location',
      website: profile.website || 'https://example.com',
      industry: profile.industry || 'Technology',
      experienceLevel: profile.experienceLevel || 1,
      rating: profile.rating || 4.5,
      following: profile.following || 0,
      followers: profile.followers || 0,
      profile_image_url: profile.profile_image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
      cover_image_url: profile.cover_image_url || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'profiles', userId), newProfile);
    return newProfile;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

export const updateProfile = async (userId: string, updates: Partial<UserProfile>, profileImage?: File, coverImage?: File) => {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      throw new Error('Profile not found');
    }
    
    const currentProfile = profileSnap.data() as UserProfile;
    
    // Handle profile image upload if provided
    let profileImageUrl = currentProfile.profile_image_url;
    if (profileImage) {
      const profileImageRef = ref(storage, `profile-images/${userId}/${uuidv4()}`);
      await uploadBytes(profileImageRef, profileImage);
      profileImageUrl = await getDownloadURL(profileImageRef);
    }
    
    // Handle cover image upload if provided
    let coverImageUrl = currentProfile.cover_image_url;
    if (coverImage) {
      const coverImageRef = ref(storage, `cover-images/${userId}/${uuidv4()}`);
      await uploadBytes(coverImageRef, coverImage);
      coverImageUrl = await getDownloadURL(coverImageRef);
    }
    
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      profile_image_url: profileImageUrl,
      cover_image_url: coverImageUrl,
      updated_at: new Date().toISOString()
    };
    
    await updateDoc(profileRef, updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
};

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  // First check if this is an AI user
  const aiUser = AI_USERS[userId];
  if (aiUser) return aiUser;

  // Then check if this is a placeholder user
  const placeholderUser = PLACEHOLDER_USERS[userId];
  if (placeholderUser) return placeholderUser;

  // Finally check Firestore
  try {
    const docRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    
    // Return a default profile if none exists
    return {
      id: userId,
      name: 'Demo User',
      username: '@demo',
      email: 'demo@example.com',
      bio: 'This is a demo profile',
      location: 'Demo City',
      website: 'https://example.com',
      industry: 'Technology',
      experienceLevel: 1,
      rating: 4.5,
      following: 100,
      followers: 250,
      profile_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
      cover_image_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};

export const createProfileOnSignup = async (userId: string, email: string) => {
  return createProfile(userId, {
    email,
    name: email.split('@')[0],
    username: `@${email.split('@')[0]}`,
  });
};