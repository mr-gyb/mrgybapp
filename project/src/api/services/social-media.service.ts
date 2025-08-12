import axios from 'axios';

export interface SocialMediaPost {
  id: string;
  title: string;
  description?: string;
  views: string;
  likes: string;
  image: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';
  url?: string;
  author?: string;
  timestamp: string;
  engagement_rate?: number;
}

export interface SocialMediaResponse {
  posts: SocialMediaPost[];
  total: number;
  platform: string;
}

// Mock data for demonstration - in production, this would fetch from real APIs
const mockSocialMediaPosts: SocialMediaPost[] = [
  {
    id: '1',
    title: "BREAKING: The Menendez brothers are one step closer to freedom after L...",
    views: "72.3M",
    likes: "5.9M",
    image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    platform: 'tiktok',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    engagement_rate: 8.2,
    url: 'https://tiktok.com/@user/video/123'
  },
  {
    id: '2',
    title: "Wait 😂",
    views: "36.1M",
    likes: "6.3M",
    image: "https://images.unsplash.com/photo-1586374579358-9d19d632b6df?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    platform: 'instagram',
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    engagement_rate: 17.4,
    url: 'https://instagram.com/p/abc123'
  },
  {
    id: '3',
    title: "Former President Barack Obama raps Eminem's \"Lose Yourself,\" after bei...",
    views: "40.1M",
    likes: "2.9M",
    image: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    platform: 'youtube',
    timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    engagement_rate: 7.2,
    url: 'https://youtube.com/watch?v=abc123'
  },
  {
    id: '4',
    title: "This AI-generated artwork is absolutely mind-blowing 🤯",
    views: "28.7M",
    likes: "4.2M",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    platform: 'instagram',
    timestamp: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    engagement_rate: 14.6,
    url: 'https://instagram.com/p/def456'
  },
  {
    id: '5',
    title: "The future of content creation is here 🚀",
    views: "15.3M",
    likes: "1.8M",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    platform: 'twitter',
    timestamp: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
    engagement_rate: 11.8,
    url: 'https://twitter.com/user/status/123456'
  },
  {
    id: '6',
    title: "How to create viral content in 2024 📈",
    views: "22.9M",
    likes: "3.1M",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    platform: 'youtube',
    timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
    engagement_rate: 13.5,
    url: 'https://youtube.com/watch?v=def456'
  }
];

/**
 * Fetch top social media posts for inspiration
 * In production, this would integrate with real social media APIs
 */
export const fetchTopSocialMediaPosts = async (limit: number = 3): Promise<SocialMediaPost[]> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Sort by engagement rate and return top posts
    const sortedPosts = [...mockSocialMediaPosts]
      .sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
      .slice(0, limit);
    
    return sortedPosts;
  } catch (error) {
    console.error('Error fetching social media posts:', error);
    // Return fallback data
    return mockSocialMediaPosts.slice(0, limit);
  }
};

/**
 * Fetch posts by platform
 */
export const fetchPostsByPlatform = async (platform: string, limit: number = 3): Promise<SocialMediaPost[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const platformPosts = mockSocialMediaPosts
      .filter(post => post.platform === platform)
      .sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
      .slice(0, limit);
    
    return platformPosts;
  } catch (error) {
    console.error(`Error fetching ${platform} posts:`, error);
    return mockSocialMediaPosts
      .filter(post => post.platform === platform)
      .slice(0, limit);
  }
};

/**
 * Fetch trending content across all platforms
 */
export const fetchTrendingContent = async (limit: number = 3): Promise<SocialMediaPost[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Get posts from last 24 hours with high engagement
    const recentPosts = mockSocialMediaPosts
      .filter(post => {
        const postTime = new Date(post.timestamp).getTime();
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        return postTime > oneDayAgo && (post.engagement_rate || 0) > 10;
      })
      .sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
      .slice(0, limit);
    
    return recentPosts;
  } catch (error) {
    console.error('Error fetching trending content:', error);
    return mockSocialMediaPosts.slice(0, limit);
  }
};

/**
 * Get platform-specific trending content
 */
export const getPlatformTrendingContent = async (): Promise<Record<string, SocialMediaPost[]>> => {
  const platforms = ['instagram', 'tiktok', 'youtube', 'twitter'];
  const result: Record<string, SocialMediaPost[]> = {};
  
  for (const platform of platforms) {
    result[platform] = await fetchPostsByPlatform(platform, 1);
  }
  
  return result;
};