import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { UserProfile } from '../../types/user';
import { v4 as uuidv4 } from 'uuid';

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'profiles', userId);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};

export const createProfile = async (userId: string, initialData: Partial<UserProfile> = {}): Promise<UserProfile> => {
  try {
    const newProfile: UserProfile = {
      id: userId,
      name: initialData.name || '',
      username: initialData.username || '',
      email: initialData.email || '',
      bio: initialData.bio || 'Tell us about yourself...',
      location: initialData.location || 'Location',
      website: initialData.website || 'https://example.com',
      industry: initialData.industry || 'Technology',
      experienceLevel: initialData.experienceLevel || 1,
      rating: initialData.rating || 4.5,
      following: initialData.following || 0,
      followers: initialData.followers || 0,
      profile_image_url: initialData.profile_image_url ||''/* 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80'*/,
      cover_image_url: initialData.cover_image_url || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
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

export const updateProfile = async (userId: string, updates: Partial<UserProfile>, profileImage?: File | null, coverImage?: File | null): Promise<UserProfile | null> => {
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