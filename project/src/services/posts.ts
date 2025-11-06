/**
 * Community Posts Service
 * 
 * Firestore Rules Required:
 * - Auth required to create posts/comments/likes
 * - Only owners can update/delete their posts
 * - Users can read posts where visibility='anyone' OR (visibility='friends' AND author is in their friends list)
 * - Comments allowed for any authed user to create; delete by author or post owner
 * - Likes are stored in likedBy array on post document
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  or,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post, Comment } from '../types/community';
import { watchConnections } from './friends';

// Collection references
const postsCollection = collection(db, 'posts');

/**
 * Helper: Check if two users are friends
 * @param userId - Current user ID
 * @param otherId - Other user ID to check
 * @returns Promise<boolean>
 */
export const isFriend = async (userId: string, otherId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const unsubscribe = watchConnections(userId, (friends) => {
      unsubscribe(); // Unsubscribe immediately after first callback
      resolve(friends.includes(otherId));
    });
  });
};

/**
 * Create a new post
 */
export const createPost = async (
  params: { text: string; imageURL?: string; visibility?: 'anyone' | 'friends' },
  currentUser: { uid: string; displayName?: string; photoURL?: string }
): Promise<string> => {
  const trimmedText = params.text.trim();
  const trimmedImageURL = params.imageURL?.trim();

  // Validate: must have either text or imageURL
  if (!trimmedText && !trimmedImageURL) {
    throw new Error('Post cannot be empty. Please add text or an image.');
  }

  // Validate text length (500 chars max)
  if (trimmedText.length > 500) {
    throw new Error('Post text cannot exceed 500 characters.');
  }

  // Normalize author name: use displayName if available, otherwise use email (trimmed and consistent)
  let authorName = currentUser.displayName?.trim() || 'Unknown';
  if (!authorName || authorName === 'Unknown') {
    // If displayName is not available, this should be handled by the caller
    // But we'll ensure it's not empty
    authorName = authorName || 'Anonymous';
  }

  const postData = {
    authorId: currentUser.uid,
    authorName: authorName,
    authorPhotoURL: currentUser.photoURL || null,
    text: trimmedText,
    imageURL: trimmedImageURL || null,
    visibility: params.visibility || 'anyone',
    likeCount: 0,
    likedBy: [],
    commentsCount: 0,
    repostCount: 0,
    shareCount: 0,
    isAI: false,
    createdAt: serverTimestamp()
  };

  console.log('📝 Creating post with data:', {
    authorId: postData.authorId,
    authorName: postData.authorName,
    textLength: postData.text.length,
    hasImage: !!postData.imageURL,
    visibility: postData.visibility
  });

  const docRef = await addDoc(postsCollection, postData);
  console.log('✅ Post created successfully:', docRef.id);
  console.log('📰 Post should appear in feed via real-time listener');
  return docRef.id;
};

/**
 * Fetch posts page with pagination (updated interface)
 * @param params - Pagination parameters
 * @param params.lastDoc - Last document from previous page (for pagination)
 * @param params.pageSize - Number of posts per page (default 10)
 * @param params.currentUserId - Current user ID for visibility filtering
 * @returns Promise<{ posts: Post[]; lastDoc: QueryDocumentSnapshot | null; hasMore: boolean }>
 */
export const fetchPostsPage = async (params: {
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null;
  pageSize?: number;
  currentUserId?: string;
}): Promise<{ posts: Post[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null; hasMore: boolean }> => {
  const pageSize = params.pageSize || 10;
  const lastDoc = params.lastDoc || null;
  const currentUserId = params.currentUserId;
  
  return listPostsPage(pageSize, lastDoc, currentUserId);
};

/**
 * List posts with pagination
 * @param pageSize - Number of posts per page (default 4)
 * @param lastDoc - Last document from previous page (for pagination)
 * @param currentUserId - Current user ID for visibility filtering
 * @returns Promise<{ posts: Post[]; lastDoc: QueryDocumentSnapshot | null; hasMore: boolean }>
 */
export const listPostsPage = async (
  pageSize: number = 4,
  lastDoc: QueryDocumentSnapshot<DocumentData> | null = null,
  currentUserId?: string
): Promise<{ posts: Post[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null; hasMore: boolean }> => {
  // Fetch one extra to check if there are more posts
  let q = query(
    postsCollection,
    orderBy('createdAt', 'desc')
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  q = query(q, limit(pageSize + 1)); // Fetch one extra to check hasMore

  const snapshot = await getDocs(q);
  const posts: Post[] = [];
  let newLastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
  const hasMore = snapshot.docs.length > pageSize;

  // Filter posts by visibility if user is signed in
  // Only process up to pageSize documents
  const docsToProcess = snapshot.docs.slice(0, pageSize);
  
  for (const docSnapshot of docsToProcess) {
    const data = docSnapshot.data();
    
    // Check visibility
    if (data.visibility === 'friends') {
      if (!currentUserId) {
        // Skip friends-only posts if user not signed in
        continue;
      }
      // Check if author is in user's friends list
      const isAuthorFriend = await isFriend(currentUserId, data.authorId);
      if (!isAuthorFriend && data.authorId !== currentUserId) {
        // Skip if not friends and not own post
        continue;
      }
    }

    posts.push({
      id: docSnapshot.id,
      authorId: data.authorId,
      authorName: data.authorName || 'Anonymous',
      authorPhotoURL: data.authorPhotoURL || undefined,
      text: data.text,
      imageURL: data.imageURL || undefined,
      visibility: data.visibility || 'anyone',
      likeCount: data.likeCount || 0,
      likedBy: data.likedBy || [],
    commentsCount: data.commentsCount || 0,
    repostCount: data.repostCount || 0,
    shareCount: data.shareCount || 0,
    isAI: data.isAI || false,
    createdAt: data.createdAt?.toDate() || null
    });
    
    // Set lastDoc to the last processed document
    newLastDoc = docSnapshot;
  }

  // If we didn't process any documents, set hasMore to false
  const finalHasMore = hasMore && posts.length > 0;

  return { posts, lastDoc: newLastDoc, hasMore: finalHasMore };
};

/**
 * Watch feed in real-time with visibility filtering
 * @param currentUserId - Current user ID for visibility filtering
 * @param cb - Callback function
 * @returns Unsubscribe function
 */
export const watchFeed = (
  currentUserId?: string,
  cb?: (posts: Post[]) => void
): (() => void) => {
  const q = query(
    postsCollection,
    orderBy('createdAt', 'desc'),
    limit(50) // Fetch more to filter by visibility
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    console.log(`📰 Feed snapshot received: ${snapshot.docs.length} documents`);
    
    const posts: Post[] = [];
    const friendsCache = new Map<string, boolean>();

    // Helper to check if user is friend (with caching)
    const checkIsFriend = async (userId: string, otherId: string): Promise<boolean> => {
      if (userId === otherId) return true; // User is always their own friend
      
      const cacheKey = `${userId}_${otherId}`;
      if (friendsCache.has(cacheKey)) {
        return friendsCache.get(cacheKey)!;
      }
      
      const result = await isFriend(userId, otherId);
      friendsCache.set(cacheKey, result);
      return result;
    };

    // Process posts and filter by visibility
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      
      // Check visibility
      if (data.visibility === 'friends') {
        if (!currentUserId) {
          // Skip friends-only posts if user not signed in
          continue;
        }
        // Check if author is in user's friends list
        const isAuthorFriend = await checkIsFriend(currentUserId, data.authorId);
        if (!isAuthorFriend && data.authorId !== currentUserId) {
          // Skip if not friends and not own post
          continue;
        }
      }

      posts.push({
        id: docSnapshot.id,
        authorId: data.authorId,
        authorName: data.authorName || 'Anonymous',
        authorPhotoURL: data.authorPhotoURL || undefined,
        text: data.text,
        imageURL: data.imageURL || undefined,
        visibility: data.visibility || 'anyone',
        likeCount: data.likeCount || 0,
        likedBy: data.likedBy || [],
    commentsCount: data.commentsCount || 0,
    repostCount: data.repostCount || 0,
    shareCount: data.shareCount || 0,
    isAI: data.isAI || false,
    createdAt: data.createdAt?.toDate() || null
      });
    }

    console.log(`📰 Feed updated: ${posts.length} posts (after visibility filter)`);
    if (cb) {
      // Sort by createdAt desc (newest first)
      const sortedPosts = posts.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      cb(sortedPosts);
    }
  }, (error) => {
    console.error('❌ Error watching feed:', error);
    // Call callback with empty array on error to prevent UI from breaking
    if (cb) cb([]);
  });

  return unsubscribe;
};

/**
 * Subscribe to recent posts for real-time updates
 * @param params - Subscription parameters
 * @param params.limit - Maximum number of posts to fetch (default 50)
 * @param params.currentUserId - Current user ID for visibility filtering
 * @param onAdd - Callback when new posts are added
 * @returns Unsubscribe function
 */
export const subscribeRecentPosts = (
  params: { limit?: number; currentUserId?: string },
  onAdd: (posts: Post[]) => void
): (() => void) => {
  const limitCount = params.limit || 50;
  const currentUserId = params.currentUserId;

  const q = query(
    postsCollection,
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    console.log(`📰 Recent posts snapshot received: ${snapshot.docs.length} documents`);
    
    const posts: Post[] = [];
    const friendsCache = new Map<string, boolean>();

    // Helper to check if user is friend (with caching)
    const checkIsFriend = async (userId: string, otherId: string): Promise<boolean> => {
      if (userId === otherId) return true;
      
      const cacheKey = `${userId}_${otherId}`;
      if (friendsCache.has(cacheKey)) {
        return friendsCache.get(cacheKey)!;
      }
      
      const result = await isFriend(userId, otherId);
      friendsCache.set(cacheKey, result);
      return result;
    };

    // Process posts and filter by visibility
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      
      // Check visibility
      if (data.visibility === 'friends') {
        if (!currentUserId) {
          continue;
        }
        const isAuthorFriend = await checkIsFriend(currentUserId, data.authorId);
        if (!isAuthorFriend && data.authorId !== currentUserId) {
          continue;
        }
      }

      posts.push({
        id: docSnapshot.id,
        authorId: data.authorId,
        authorName: data.authorName || 'Anonymous',
        authorPhotoURL: data.authorPhotoURL || undefined,
        text: data.text,
        imageURL: data.imageURL || undefined,
        visibility: data.visibility || 'anyone',
        likeCount: data.likeCount || 0,
        likedBy: data.likedBy || [],
    commentsCount: data.commentsCount || 0,
    repostCount: data.repostCount || 0,
    shareCount: data.shareCount || 0,
    isAI: data.isAI || false,
    createdAt: data.createdAt?.toDate() || null
      });
    }

    // Sort by createdAt desc (newest first)
    const sortedPosts = posts.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    console.log(`📰 Recent posts updated: ${sortedPosts.length} posts`);
    onAdd(sortedPosts);
  }, (error) => {
    console.error('❌ Error watching recent posts:', error);
    onAdd([]);
  });

  return unsubscribe;
};

/**
 * Check if user has liked a post (using likedBy array)
 */
export const hasLiked = async (postId: string, userId: string): Promise<boolean> => {
  const postRef = doc(postsCollection, postId);
  const postDoc = await getDoc(postRef);
  
  if (!postDoc.exists()) {
    return false;
  }
  
  const data = postDoc.data();
  const likedBy = data.likedBy || [];
  return likedBy.includes(userId);
};

/**
 * Like a post (add userId to likedBy array)
 */
export const likePost = async (postId: string, userId: string): Promise<void> => {
  const postRef = doc(postsCollection, postId);

  await runTransaction(db, async (transaction) => {
    const postDoc = await transaction.get(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    const data = postDoc.data();
    const likedBy = data.likedBy || [];
    const likeCount = data.likeCount || 0;

    // Check if already liked
    if (likedBy.includes(userId)) {
      throw new Error('Post already liked');
    }

    // Add userId to likedBy and increment count
    transaction.update(postRef, {
      likedBy: [...likedBy, userId],
      likeCount: likeCount + 1
    });
  });

  console.log('✅ Post liked');
};

/**
 * Unlike a post (remove userId from likedBy array)
 */
export const unlikePost = async (postId: string, userId: string): Promise<void> => {
  const postRef = doc(postsCollection, postId);

  await runTransaction(db, async (transaction) => {
    const postDoc = await transaction.get(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    const data = postDoc.data();
    let likedBy = data.likedBy || [];
    const likeCount = data.likeCount || 0;

    // Check if liked
    if (!likedBy.includes(userId)) {
      throw new Error('Post not liked');
    }

    // Remove userId from likedBy and decrement count
    likedBy = likedBy.filter((id: string) => id !== userId);
    transaction.update(postRef, {
      likedBy,
      likeCount: Math.max(0, likeCount - 1)
    });
  });

  console.log('✅ Post unliked');
};

/**
 * Get like state for current user
 */
export const getLikeState = async (postId: string, userId: string): Promise<boolean> => {
  return hasLiked(postId, userId);
};

/**
 * Toggle like state (like if not liked, unlike if liked)
 */
export const toggleLike = async (postId: string, userId: string): Promise<void> => {
  const isLiked = await hasLiked(postId, userId);
  if (isLiked) {
    await unlikePost(postId, userId);
  } else {
    await likePost(postId, userId);
  }
};

/**
 * Watch comments for a post
 */
export const watchComments = (
  postId: string,
  cb: (comments: Comment[]) => void
): (() => void) => {
  const commentsCollection = collection(db, `posts/${postId}/comments`);
  const q = query(commentsCollection, orderBy('createdAt', 'asc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const comments: Comment[] = [];

    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      comments.push({
        id: docSnapshot.id,
        authorId: data.authorId,
        authorName: data.authorName || 'Anonymous',
        authorPhotoURL: data.authorPhotoURL || undefined,
        text: data.text,
        createdAt: data.createdAt?.toDate() || null
      });
    });

    console.log(`💬 Comments updated for post ${postId}: ${comments.length} comments`);
    cb(comments);
  }, (error) => {
    console.error('❌ Error watching comments:', error);
  });

  return unsubscribe;
};

/**
 * Add a comment to a post
 */
export const addComment = async (
  postId: string,
  params: { text: string },
  currentUser: { uid: string; displayName?: string; photoURL?: string }
): Promise<string> => {
  if (!params.text.trim()) {
    throw new Error('Comment text cannot be empty');
  }

  const postRef = doc(postsCollection, postId);
  const commentsCollection = collection(db, `posts/${postId}/comments`);

  // Add comment
  const commentData = {
    authorId: currentUser.uid,
    authorName: currentUser.displayName || 'Anonymous',
    authorPhotoURL: currentUser.photoURL || null,
    text: params.text.trim(),
    createdAt: serverTimestamp()
  };

  const commentRef = await addDoc(commentsCollection, commentData);
  const commentId = commentRef.id;

  // Update comment count in a transaction
  await runTransaction(db, async (transaction) => {
    const postDoc = await transaction.get(postRef);
    
    if (postDoc.exists()) {
      transaction.update(postRef, {
        commentsCount: (postDoc.data().commentsCount || 0) + 1
      });
    }
  });

  console.log('✅ Comment added:', commentId);
  return commentId;
};

/**
 * Repost a post (increment repostCount)
 */
export const repostPost = async (postId: string, userId: string): Promise<void> => {
  const postRef = doc(postsCollection, postId);

  await runTransaction(db, async (transaction) => {
    const postDoc = await transaction.get(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    const data = postDoc.data();
    const repostCount = data.repostCount || 0;

    transaction.update(postRef, {
      repostCount: repostCount + 1
    });
  });

  console.log('✅ Post reposted');
};

/**
 * Share a post (increment shareCount)
 */
export const sharePost = async (postId: string, userId: string): Promise<void> => {
  const postRef = doc(postsCollection, postId);

  await runTransaction(db, async (transaction) => {
    const postDoc = await transaction.get(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    const data = postDoc.data();
    const shareCount = data.shareCount || 0;

    transaction.update(postRef, {
      shareCount: shareCount + 1
    });
  });

  console.log('✅ Post shared');
};

/**
 * Delete a post and all its comments
 * @param postId - Post ID to delete
 * @param userId - User ID requesting deletion (must be post author)
 */
export const deletePost = async (postId: string, userId: string): Promise<void> => {
  const postRef = doc(postsCollection, postId);
  
  // First verify the post exists and user is the author
  const postDoc = await getDoc(postRef);
  
  if (!postDoc.exists()) {
    throw new Error('Post not found');
  }
  
  const postData = postDoc.data();
  if (postData.authorId !== userId) {
    throw new Error('You can only delete your own posts');
  }
  
  // Delete all comments in the subcollection
  const commentsCollection = collection(db, `posts/${postId}/comments`);
  const commentsSnapshot = await getDocs(commentsCollection);
  
  // Delete all comments
  const deletePromises = commentsSnapshot.docs.map((commentDoc) => 
    deleteDoc(doc(commentsCollection, commentDoc.id))
  );
  await Promise.all(deletePromises);
  
  // Delete the post itself
  await deleteDoc(postRef);
  
  console.log('✅ Post deleted:', postId);
};
