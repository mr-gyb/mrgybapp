/**
 * Follow/Unfollow Service
 * 
 * Uses a friendships collection with document key: ${viewerId}_${targetId}
 * Document structure:
 * {
 *   viewerId: string,
 *   targetId: string,
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const friendshipsCollection = collection(db, 'friendships');

/**
 * Get friendship document ID
 */
const getFriendshipId = (viewerId: string, targetId: string): string => {
  return `${viewerId}_${targetId}`;
};

/**
 * Check if viewer is following target
 */
export const isFollowing = async (viewerId: string, targetId: string): Promise<boolean> => {
  if (viewerId === targetId) return false; // Can't follow yourself
  
  const friendshipId = getFriendshipId(viewerId, targetId);
  const friendshipRef = doc(friendshipsCollection, friendshipId);
  const friendshipDoc = await getDoc(friendshipRef);
  
  return friendshipDoc.exists();
};

/**
 * Follow a user
 */
export const followUser = async (viewerId: string, targetId: string): Promise<void> => {
  if (viewerId === targetId) {
    throw new Error('Cannot follow yourself');
  }

  const friendshipId = getFriendshipId(viewerId, targetId);
  const friendshipRef = doc(friendshipsCollection, friendshipId);
  
  // Check if already following
  const existingDoc = await getDoc(friendshipRef);
  if (existingDoc.exists()) {
    return; // Already following
  }

  await setDoc(friendshipRef, {
    viewerId,
    targetId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  console.log('✅ User followed:', { viewerId, targetId });
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (viewerId: string, targetId: string): Promise<void> => {
  if (viewerId === targetId) {
    throw new Error('Cannot unfollow yourself');
  }

  const friendshipId = getFriendshipId(viewerId, targetId);
  const friendshipRef = doc(friendshipsCollection, friendshipId);
  
  await deleteDoc(friendshipRef);
  
  console.log('✅ User unfollowed:', { viewerId, targetId });
};

/**
 * Toggle follow state
 */
export const toggleFollow = async (viewerId: string, targetId: string): Promise<boolean> => {
  const currentlyFollowing = await isFollowing(viewerId, targetId);
  
  if (currentlyFollowing) {
    await unfollowUser(viewerId, targetId);
    return false;
  } else {
    await followUser(viewerId, targetId);
    return true;
  }
};

/**
 * Watch follow state for a specific user
 */
export const watchFollowState = (
  viewerId: string,
  targetId: string,
  callback: (isFollowing: boolean) => void
): (() => void) => {
  if (viewerId === targetId) {
    callback(false);
    return () => {}; // Return no-op unsubscribe
  }

  const friendshipId = getFriendshipId(viewerId, targetId);
  const friendshipRef = doc(friendshipsCollection, friendshipId);

  const unsubscribe = onSnapshot(
    friendshipRef,
    (snapshot) => {
      callback(snapshot.exists());
    },
    (error) => {
      console.error('❌ Error watching follow state:', error);
      callback(false);
    }
  );

  return unsubscribe;
};

/**
 * Get all users that viewer is following
 */
export const getFollowing = async (viewerId: string): Promise<string[]> => {
  const q = query(
    friendshipsCollection,
    where('viewerId', '==', viewerId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data().targetId);
};

/**
 * Get all followers of a target user
 */
export const getFollowers = async (targetId: string): Promise<string[]> => {
  const q = query(
    friendshipsCollection,
    where('targetId', '==', targetId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data().viewerId);
};

