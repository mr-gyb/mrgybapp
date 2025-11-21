import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { watchFeed, listPostsPage } from '../../services/posts';
import { Post } from '../../types/community';
import PostCard from './PostCard';
import { Loader2, Users, ChevronDown } from 'lucide-react';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { watchConnections } from '../../services/friends';

interface CommunityFeedProps {
  searchTerm?: string;
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ searchTerm = '' }) => {
  const { user, isAuthenticated } = useAuth();
  const { showError } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [friendIds, setFriendIds] = useState<string[] | null>(null);

  const friendIdsKey = useMemo(() => {
    if (!friendIds || friendIds.length === 0) {
      return 'none';
    }
    const sorted = [...friendIds].sort();
    return sorted.join(',');
  }, [friendIds]);

  // Load initial posts and watch for real-time updates
  // Keep friend ids cached for session
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setFriendIds(null);
      return;
    }

    const unsubscribe = watchConnections(user.uid, friendUids => {
      const uniqueIds = new Set(friendUids);
      uniqueIds.add(user.uid);
      setFriendIds(Array.from(uniqueIds));
    });

    return () => {
      unsubscribe?.();
    };
  }, [isAuthenticated, user?.uid]);

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const friendIdSet = friendIds ? new Set(friendIds) : undefined;

    const unsubscribe = watchFeed({
      currentUserId: user.uid,
      friendIds: friendIdSet,
      onUpdate: fetchedPosts => {
        console.log('📰 Feed updated via watchFeed:', fetchedPosts.length, 'posts');
        setPosts(fetchedPosts);
        setHasMore(fetchedPosts.length > 4);
        setLoading(false);
      },
    });

    const loadInitialPosts = async () => {
      try {
        const result = await listPostsPage({
          pageSize: 4,
          lastDoc: null,
          currentUserId: user.uid,
          friendIds: friendIdSet,
        });

        if (result.posts.length > 0) {
          setPosts(result.posts);
          setLoading(false);
        }
        lastDocRef.current = result.lastDoc;
      } catch (error) {
        console.error('Error loading initial posts:', error);
      }
    };

    loadInitialPosts();

    return () => unsubscribe();
  }, [isAuthenticated, user?.uid, friendIdsKey]);

  // Load more posts (pagination) - now just shows all from feed
  const loadMorePosts = async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    try {
      // Instead of pagination, just show all posts from the feed
      // The watchFeed already provides all visible posts
      setShowAll(true);
      // hasMore will be updated by watchFeed callback
    } catch (error) {
      console.error('Error loading more posts:', error);
      showError('Failed to load more posts');
    } finally {
      setLoadingMore(false);
    }
  };

  // Filter posts by search term
  const filteredPosts = posts.filter(post => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      post.text.toLowerCase().includes(searchLower) ||
      post.authorName.toLowerCase().includes(searchLower)
    );
  });

  // Show 4 posts initially (2×2 grid), then all if showAll is true
  const displayedPosts = showAll ? filteredPosts : filteredPosts.slice(0, 4);
  
  // Update hasMore based on filtered posts count
  useEffect(() => {
    if (filteredPosts.length > 4 && !showAll) {
      setHasMore(true);
    } else if (showAll && filteredPosts.length <= displayedPosts.length) {
      setHasMore(false);
    }
  }, [filteredPosts.length, showAll, displayedPosts.length]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
        <Users size={48} className="text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Sign in to see the community feed.</p>
      </div>
    );
  }

  return (
    <div className="community-feed-container">
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : (
        <>
          {filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <Users size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                {searchTerm ? 'No posts found matching your search' : 'No posts yet. Be the first to share!'}
              </p>
            </div>
          ) : (
            <>
              {/* 2×2 Grid Layout */}
              <div className="grid grid-cols-2 gap-4" style={{ gap: '16px' }}>
                {displayedPosts.map((post) => (
                  <PostCard key={post.id} post={post} currentUserId={user?.uid || ''} />
                ))}
              </div>

              {/* View More Link / Load More Button */}
              {filteredPosts.length > 4 && !showAll && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMorePosts}
                    disabled={loadingMore}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>View More</span>
                        <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Load More Button (when showing all) */}
              {showAll && hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMorePosts}
                    disabled={loadingMore}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>Load More</span>
                        <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CommunityFeed;
