import React, { useState, useEffect } from 'react';
import { 
  Facebook, 
  Instagram, 
  Bookmark, 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  ExternalLink,
  RefreshCw,
  BarChart3,
  Zap
} from 'lucide-react';

export interface HighPerformingPost {
  id: string;
  title: string;
  description?: string;
  image: string;
  platform: 'facebook' | 'instagram' | 'pinterest';
  url: string;
  author: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  reach: number;
}

interface HighPerformingPostsProps {
  showRefreshButton?: boolean;
  onRefresh?: () => void;
}

const HighPerformingPosts: React.FC<HighPerformingPostsProps> = ({ 
  showRefreshButton = true,
  onRefresh 
}) => {
  const [posts, setPosts] = useState<HighPerformingPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'facebook' | 'instagram' | 'pinterest'>('all');

  // Mock data for high-performing posts
  const mockHighPerformingPosts: HighPerformingPost[] = [
    // Facebook Posts
    {
      id: 'fb-1',
      title: "The Ultimate Guide to Facebook Marketing in 2024",
      description: "Discover the latest strategies that are driving massive engagement on Facebook. From algorithm changes to content optimization, learn what works now.",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
      platform: 'facebook',
      url: 'https://facebook.com/post/123',
      author: 'Digital Marketing Pro',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      views: 1250000,
      likes: 89000,
      comments: 3400,
      shares: 12000,
      engagementRate: 8.2,
      reach: 2500000
    },
    {
      id: 'fb-2',
      title: "5 Facebook Ad Strategies That Actually Convert",
      description: "Stop wasting money on Facebook ads! These proven strategies have helped businesses increase conversions by 300%.",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
      platform: 'facebook',
      url: 'https://facebook.com/post/124',
      author: 'Ad Master',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      views: 890000,
      likes: 67000,
      comments: 2100,
      shares: 8900,
      engagementRate: 9.8,
      reach: 1800000
    },
    {
      id: 'fb-3',
      title: "How to Build a Thriving Facebook Community",
      description: "Transform your Facebook page from a broadcasting tool to an engaged community. Real strategies from successful brands.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      platform: 'facebook',
      url: 'https://facebook.com/post/125',
      author: 'Community Builder',
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      views: 670000,
      likes: 45000,
      comments: 1800,
      shares: 6700,
      engagementRate: 7.5,
      reach: 1200000
    },

    // Instagram Posts
    {
      id: 'ig-1',
      title: "Instagram Reels That Get 1M+ Views: The Complete Formula",
      description: "Learn the exact formula for creating Instagram Reels that go viral. From hook to hashtags, we break down what works.",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
      platform: 'instagram',
      url: 'https://instagram.com/p/abc123',
      author: 'Reel Master',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      views: 2100000,
      likes: 156000,
      comments: 8900,
      shares: 45000,
      engagementRate: 12.3,
      reach: 3500000
    },
    {
      id: 'ig-2',
      title: "Instagram Stories That Drive Sales: 7 Proven Tactics",
      description: "Transform your Instagram Stories from casual updates to powerful sales tools. These tactics have generated millions in revenue.",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
      platform: 'instagram',
      url: 'https://instagram.com/p/def456',
      author: 'Story Strategist',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      views: 1800000,
      likes: 134000,
      comments: 6700,
      shares: 38000,
      engagementRate: 11.8,
      reach: 2800000
    },
    {
      id: 'ig-3',
      title: "The Instagram Algorithm Secrets Nobody Talks About",
      description: "Unlock the hidden factors that determine your Instagram reach. Algorithm experts reveal what really matters in 2024.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      platform: 'instagram',
      url: 'https://instagram.com/p/ghi789',
      author: 'Algorithm Expert',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      views: 1500000,
      likes: 112000,
      comments: 5400,
      shares: 29000,
      engagementRate: 10.9,
      reach: 2200000
    },

    // Pinterest Posts
    {
      id: 'pin-1',
      title: "Pinterest SEO: How to Get Your Pins to the Top",
      description: "Master Pinterest SEO and watch your pins climb to the top of search results. Complete guide with proven strategies.",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
      platform: 'pinterest',
      url: 'https://pinterest.com/pin/123',
      author: 'Pinterest Pro',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      views: 890000,
      likes: 67000,
      comments: 1200,
      shares: 8900,
      engagementRate: 8.9,
      reach: 1500000
    },
    {
      id: 'pin-2',
      title: "Pinterest Marketing: Drive Traffic and Sales in 2024",
      description: "Transform Pinterest from a discovery platform to a traffic and sales powerhouse. Real strategies from successful businesses.",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
      platform: 'pinterest',
      url: 'https://pinterest.com/pin/124',
      author: 'Pinterest Marketer',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      views: 720000,
      likes: 54000,
      comments: 900,
      shares: 7200,
      engagementRate: 8.1,
      reach: 1200000
    },
    {
      id: 'pin-3',
      title: "Create Pinterest Pins That Go Viral: Design Secrets",
      description: "Learn the design secrets behind viral Pinterest pins. Color psychology, typography, and layout techniques that drive engagement.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      platform: 'pinterest',
      url: 'https://pinterest.com/pin/125',
      author: 'Pin Designer',
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      views: 650000,
      likes: 48000,
      comments: 800,
      shares: 6500,
      engagementRate: 7.8,
      reach: 1100000
    }
  ];

  // Load posts on component mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setPosts(mockHighPerformingPosts);
    } catch (err) {
      setError('Failed to load high-performing posts');
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadPosts();
    onRefresh?.();
  };

  const handlePlatformChange = (platform: 'all' | 'facebook' | 'instagram' | 'pinterest') => {
    setSelectedPlatform(platform);
  };

  // Filter posts by selected platform
  const filteredPosts = selectedPlatform === 'all' 
    ? posts 
    : posts.filter(post => post.platform === selectedPlatform);

  // Get top 3 posts by engagement rate
  const topPosts = filteredPosts
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 3);

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Get platform icon and color
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return { icon: Facebook, color: 'text-blue-600', bgColor: 'bg-blue-50' };
      case 'instagram':
        return { icon: Instagram, color: 'text-pink-500', bgColor: 'bg-pink-50' };
      case 'pinterest':
        return { icon: Bookmark, color: 'text-red-600', bgColor: 'bg-red-50' };
      default:
        return { icon: TrendingUp, color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  // Calculate time ago
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Zap className="w-6 h-6 mr-2 text-yellow-500" />
            High-Performing Posts
          </h2>
        </div>
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading high-performing posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Zap className="w-6 h-6 mr-2 text-yellow-500" />
            High-Performing Posts
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <BarChart3 className="w-12 h-12 mx-auto mb-2" />
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Zap className="w-6 h-6 mr-2 text-yellow-500" />
          High-Performing Posts
        </h2>
        <div className="flex items-center space-x-3">
          {/* Platform Filter */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handlePlatformChange('all')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedPlatform === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handlePlatformChange('facebook')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedPlatform === 'facebook'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Facebook
            </button>
            <button
              onClick={() => handlePlatformChange('instagram')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedPlatform === 'instagram'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Instagram
            </button>
            <button
              onClick={() => handlePlatformChange('pinterest')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedPlatform === 'pinterest'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pinterest
            </button>
          </div>

          {/* Refresh Button */}
          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Refresh posts"
            >
              <RefreshCw size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Posts Grid */}
      {topPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topPosts.map((post, index) => {
            const { icon: PlatformIcon, color, bgColor } = getPlatformIcon(post.platform);
            
            return (
              <div key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {/* Post Image */}
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  {/* Platform Badge */}
                  <div className={`absolute top-3 left-3 ${bgColor} px-2 py-1 rounded-full flex items-center space-x-1`}>
                    <PlatformIcon className={`w-4 h-4 ${color}`} />
                    <span className="text-xs font-medium text-gray-700 capitalize">{post.platform}</span>
                  </div>
                  {/* Rank Badge */}
                  <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    #{index + 1}
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                    {post.title}
                  </h3>

                  {/* Description */}
                  {post.description && (
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                      {post.description}
                    </p>
                  )}

                  {/* Author and Time */}
                  <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                    <span className="font-medium">{post.author}</span>
                    <span>{getTimeAgo(post.publishedAt)}</span>
                  </div>

                  {/* Engagement Metrics */}
                  <div className="grid grid-cols-4 gap-2 mb-4 text-xs">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Eye className="w-3 h-3 text-gray-500 mr-1" />
                      </div>
                      <div className="font-semibold text-gray-900">{formatNumber(post.views)}</div>
                      <div className="text-gray-500">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Heart className="w-3 h-3 text-red-500 mr-1" />
                      </div>
                      <div className="font-semibold text-gray-900">{formatNumber(post.likes)}</div>
                      <div className="text-gray-500">Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <MessageCircle className="w-3 h-3 text-blue-500 mr-1" />
                      </div>
                      <div className="font-semibold text-gray-900">{formatNumber(post.comments)}</div>
                      <div className="text-gray-500">Comments</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Share2 className="w-3 h-3 text-green-500 mr-1" />
                      </div>
                      <div className="font-semibold text-gray-900">{formatNumber(post.shares)}</div>
                      <div className="text-gray-500">Shares</div>
                    </div>
                  </div>

                  {/* Engagement Rate */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {post.engagementRate}% Engagement
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatNumber(post.reach)} reach
                    </span>
                  </div>

                  {/* View Post Button */}
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <span>View Post</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <BarChart3 className="w-16 h-16 mx-auto mb-2" />
          </div>
          <p className="text-gray-600">No high-performing posts found for the selected platform</p>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Posts ranked by engagement rate</span>
          <span>Updated {getTimeAgo(posts[0]?.publishedAt || new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  );
};

export default HighPerformingPosts;
