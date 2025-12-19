import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { fetchPostsPage, subscribeRecentPosts } from '../../services/posts';
import { Post } from '../../types/community';
import PostCard from './PostCard';
import PostComposer from './PostComposer';
import SecondaryTabs from './SecondaryTabs';
import { Loader2, Users, ChevronDown } from 'lucide-react';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

interface FeedViewProps {
  searchTerm?: string;
}

type SecondaryTabType = 'for-you' | 'groups' | 'explore' | 'search';

const FeedView: React.FC<FeedViewProps> = ({ searchTerm = '' }) => {
  const { user, isAuthenticated } = useAuth();
  const { showError } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [activeSecondaryTab, setActiveSecondaryTab] = useState<SecondaryTabType>('for-you');
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const isLoadingMoreRef = useRef(false);
  const PAGE_SIZE = 10;
  const INITIAL_DISPLAY_COUNT = 4; // Show 4 posts in 2×2 grid initially

  // Authors to hide from Community feed
  const HIDDEN_AUTHOR_IDS = new Set<string>([
    'mr-gyb-ai',
    'mrgyb',
    'rachel',
    'sherry',
    'user1', // Alice Johnson placeholder
  ]);

  // Initial load and real-time subscription
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe: (() => void) | null = null;

    const initializeFeed = async () => {
      try {
        // Fetch initial page
        const result = await fetchPostsPage({ 
          pageSize: PAGE_SIZE,
          currentUserId: user.uid
        });
        // Filter out posts from hidden authors
        setPosts(result.posts.filter((p) => !HIDDEN_AUTHOR_IDS.has(p.authorId)));
        lastDocRef.current = result.lastDoc;
        setHasMore(result.hasMore);
        setLoading(false);

        // Subscribe to real-time updates
        unsubscribe = subscribeRecentPosts(
          { limit: 50, currentUserId: user.uid },
          (newPosts) => {
            // Merge new posts with existing, avoiding duplicates
            setPosts((prevPosts) => {
              const existingIds = new Set(prevPosts.map((p) => p.id));
              const uniqueNewPosts = newPosts
                .filter((p) => !existingIds.has(p.id))
                .filter((p) => !HIDDEN_AUTHOR_IDS.has(p.authorId));
              
              // Combine and sort by createdAt desc
              const combined = [...uniqueNewPosts, ...prevPosts].sort((a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                return b.createdAt.getTime() - a.createdAt.getTime();
              });
              
              return combined;
            });
          }
        );
      } catch (error) {
        console.error('Error initializing feed:', error);
        showError('Failed to load feed. Please try again.');
        setLoading(false);
      }
    };

    initializeFeed();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, user?.uid, showError]);

  // Load more posts with debouncing
  const loadMorePosts = useCallback(async () => {
    if (loadingMore || isLoadingMoreRef.current || !hasMore || !lastDocRef.current) {
      return;
    }

    isLoadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const result = await fetchPostsPage({
        lastDoc: lastDocRef.current,
        pageSize: PAGE_SIZE,
        currentUserId: user?.uid
      });

      setPosts((prevPosts) => {
        // Merge new posts, avoiding duplicates
        const existingIds = new Set(prevPosts.map((p) => p.id));
        const newPosts = result.posts
          .filter((p) => !existingIds.has(p.id))
          .filter((p) => !HIDDEN_AUTHOR_IDS.has(p.authorId));
        
        return [...prevPosts, ...newPosts];
      });

      lastDocRef.current = result.lastDoc;
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading more posts:', error);
      showError('Failed to load more posts. Please try again.');
    } finally {
      setLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [loadingMore, hasMore, showError]);

  // Filter posts by search term
  const filteredPosts = posts.filter((post) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      post.text.toLowerCase().includes(searchLower) ||
      post.authorName.toLowerCase().includes(searchLower)
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
        <Users size={48} className="text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
          Sign in to see the community feed.
        </p>
      </div>
    );
  }

  return (
    <div className="feed-view-container">
      {/* Post Composer */}
      {isAuthenticated && (
        <PostComposer
          onPostCreated={(newPost) => {
            setPosts((prevPosts) => {
              const existingIds = new Set(prevPosts.map((p) => p.id));
              if (existingIds.has(newPost.id)) {
                return prevPosts;
              }
              return [newPost, ...prevPosts];
            });
          }}
        />
      )}

      {/* Secondary Tabs */}
      <SecondaryTabs
        activeTab={activeSecondaryTab}
        onTabChange={(tab) => {
          if (tab === 'for-you') {
            setActiveSecondaryTab(tab);
          }
          // Other tabs are non-functional for now
        }}
      />

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
              {/* Single-column Feed Layout */}
              <div className="space-y-4">
                {(showAll ? filteredPosts : filteredPosts.slice(0, INITIAL_DISPLAY_COUNT)).map((post) => (
                  <PostCard key={post.id} post={post} currentUserId={user?.uid || ''} />
                ))}
              </div>

              {/* View More Link - Centered beneath grid */}
              {filteredPosts.length > INITIAL_DISPLAY_COUNT && !showAll && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => {
                      setShowAll(true);
                      // Load more posts if needed
                      if (hasMore && !loadingMore && lastDocRef.current) {
                        loadMorePosts();
                      }
                    }}
                    disabled={loadingMore}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed underline decoration-2 underline-offset-2"
                  >
                    View More
                  </button>
                </div>
              )}

              {/* Load More Button (when showing all) */}
              {showAll && hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMorePosts}
                    disabled={loadingMore}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
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

export default FeedView;

