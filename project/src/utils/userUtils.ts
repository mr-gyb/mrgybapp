import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Check if a user is new based on their profile data
 * A user is considered "new" if:
 * 1. They have a profile but haven't completed onboarding
 * 2. They don't have any roadmap-related data
 * 3. Their profile was created recently (within last 7 days) and has minimal activity
 */
export const isNewUser = async (userId: string): Promise<boolean> => {
  try {
    const userDocRef = doc(db, 'profiles', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return true; // No profile exists, definitely new
    }
    
    const userData = userDoc.data();
    const now = new Date();
    const createdAt = new Date(userData.created_at);
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // Check if user is new based on:
    // 1. Profile created within last 7 days
    // 2. No roadmap completion data
    // 3. Minimal profile completion
    const isRecentlyCreated = daysSinceCreation <= 7;
    const hasMinimalProfile = !userData.bio || userData.bio === 'Tell us about yourself...';
    const hasDefaultLocation = !userData.location || userData.location === 'Location';
    const hasDefaultWebsite = !userData.website || userData.website === 'https://example.com';
    
    // Check for roadmap completion data (you might want to add a roadmap_completed field to user profile)
    const hasRoadmapData = userData.roadmap_completed || userData.assessment_completed;
    
    return isRecentlyCreated && (hasMinimalProfile || hasDefaultLocation || hasDefaultWebsite) && !hasRoadmapData;
    
  } catch (error) {
    console.error('Error checking if user is new:', error);
    // If there's an error, assume they're new to be safe
    return true;
  }
};
