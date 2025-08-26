import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  email: string;
  industry: string;
  experienceLevel: number;
  rating: number;
  following: number;
  followers: number;
  profile_image_url: string;
  cover_image_url: string;
  created_at: string;
  updated_at: string;
  authProvider?: 'email' | 'facebook' | 'google';
  isAI?: boolean;
  isPlaceholder?: boolean;
  darkMode?: boolean;
  content?: {
    posts?: { id: number; title: string; date: string; likes: number; comments: number; }[];
    subs?: { id: number; name: string; tier: string; since: string; amount: number; }[];
    media?: { id: number; type: string; title: string; thumbnail?: string; url?: string; }[];
    highlights?: { id: string; title: string; description: string; image: string; date: string; category: string; }[];
  };
}

export const AI_USERS: Record<string, UserProfile> = {
  'mr-gyb-ai': {
    id: 'mr-gyb-ai',
    name: 'Mr.GYB AI',
    username: '@mr_gyb_ai',
    bio: 'Your all-in-one business growth assistant. Expert in digital marketing, content creation, and business strategy.',
    location: 'Global',
    website: 'https://ai.mrgyb.com',
    email: 'ai@mrgyb.com',
    industry: 'Business Growth',
    experienceLevel: 5,
    rating: 5.0,
    following: 1000000,
    followers: 5000000,
    profile_image_url: 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58',
    cover_image_url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    isAI: true
  },
  'chris': {
    id: 'chris',
    name: 'Chris',
    username: '@chris_ai',
    bio: 'Strategic planning and business development expert. Focused on high-level decision making and organizational leadership.',
    location: 'Global',
    website: 'https://ai.mrgyb.com/ceo',
    email: 'ceo@mrgyb.com',
    industry: 'Executive Leadership',
    experienceLevel: 5,
    rating: 4.9,
    following: 500000,
    followers: 2000000,
    profile_image_url: 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FChris-ai.png?alt=media&token=83b2003d-04bf-422e-a0f7-26d148a4ff46',
    cover_image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    isAI: true
  },
  'sherry': {
    id: 'sherry',
    name: 'Sherry',
    username: '@sherry_ai',
    bio: 'Operations management and process optimization specialist. Expert in efficiency and organizational excellence.',
    location: 'Global',
    website: 'https://ai.mrgyb.com/coo',
    email: 'coo@mrgyb.com',
    industry: 'Operations Management',
    experienceLevel: 5,
    rating: 4.8,
    following: 300000,
    followers: 1500000,
    profile_image_url: 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FCOO.png?alt=media&token=d57a97eb-83f5-4e0d-903e-278dc2a4d9af',
    cover_image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    isAI: true
  },
  'charlotte': {
    id: 'charlotte',
    name: 'Charlotte',
    username: '@charlotte_ai',
    bio: 'Human resources and organizational development expert. Focused on talent management and company culture.',
    location: 'Global',
    website: 'https://ai.mrgyb.com/chro',
    email: 'chro@mrgyb.com',
    industry: 'Human Resources',
    experienceLevel: 5,
    rating: 4.7,
    following: 200000,
    followers: 1000000,
    profile_image_url: 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FCHRO.png?alt=media&token=862bbf8c-373b-4996-89fe-8d867f378d9f',
    cover_image_url: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    isAI: true
  },
  'jake': {
    id: 'jake',
    name: 'Jake',
    username: '@jake_ai',
    bio: 'Technology strategy and innovation expert. Specialized in digital transformation and technical architecture.',
    location: 'Global',
    website: 'https://ai.mrgyb.com/cto',
    email: 'cto@mrgyb.com',
    industry: 'Technology',
    experienceLevel: 5,
    rating: 4.9,
    following: 400000,
    followers: 1800000,
    profile_image_url: 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FJake-ai.png?alt=media&token=cf28a12b-f86a-4aed-b5af-32f5de16cfe9',
    cover_image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    isAI: true
  },
  'rachel': {
    id: 'rachel',
    name: 'Rachel',
    username: '@rachel_ai',
    bio: 'Marketing strategy and brand development expert. Focused on customer engagement and market growth.',
    location: 'Global',
    website: 'https://ai.mrgyb.com/cmo',
    email: 'cmo@mrgyb.com',
    industry: 'Marketing',
    experienceLevel: 5,
    rating: 4.8,
    following: 350000,
    followers: 1600000,
    profile_image_url: 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FCMO.png?alt=media&token=4e9ddaee-c4b0-4b4d-aca8-6c4196a5dd1b',
    cover_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    isAI: true
  }
};

export const PLACEHOLDER_USERS: Record<string, UserProfile> = {
  'user1': {
    id: 'user1',
    name: 'Alice Johnson',
    username: '@alice_j',
    bio: 'Professional videographer with a passion for storytelling through visual media.',
    location: 'San Francisco, CA',
    website: 'https://alicejohnson.com',
    email: 'alice@example.com',
    industry: 'Video Production',
    experienceLevel: 4,
    rating: 4.8,
    following: 250,
    followers: 1000,
    profile_image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    isPlaceholder: true
  }
};

export const getAIUser = (userId: string): UserProfile | null => {
  return AI_USERS[userId] || null;
};

export const getPlaceholderUser = (userId: string): UserProfile | null => {
  return PLACEHOLDER_USERS[userId] || null;
};

export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  // First check AI users
  const aiUser = getAIUser(userId);
  if (aiUser) return aiUser;

  // Then check placeholder users
  const placeholderUser = getPlaceholderUser(userId);
  if (placeholderUser) return placeholderUser;

  // Finally check Firestore database
  try {
    const docRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};