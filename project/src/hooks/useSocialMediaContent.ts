import { useState, useEffect } from 'react';
import { fetchTopSocialMediaPosts, fetchTrendingContent, SocialMediaPost } from '../api/services/social-media.service';

interface UseSocialMediaContentReturn {
  posts: SocialMediaPost[];
  isLoading: boolean;
  error: string | null;
  refreshPosts: () => Promise<void>;
}

export const useSocialMediaContent = (limit: number = 3): UseSocialMediaContentReturn => {
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch trending content for inspiration
      const trendingPosts = await fetchTrendingContent(limit);
      setPosts(trendingPosts);
    } catch (err) {
      setError('Failed to fetch social media content');
      console.error('Error fetching social media content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPosts = async () => {
    await fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, [limit]);

  return {
    posts,
    isLoading,
    error,
    refreshPosts
  };
}; 