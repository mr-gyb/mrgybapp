import React, { useState, useEffect } from 'react';
import { getFacebookMetrics, getFacebookPostMetrics } from '../api/services/facebook.service';

interface FacebookPost {
  id: string;
  message: string;
  created_time: string;
  impressions: number;
  reactions: number;
  shares: number;
  comments: number;
}

const FacebookPostsDisplay: React.FC = () => {
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get overall metrics
        const pageId = import.meta.env.VITE_FACEBOOK_PAGE_ID;
        const metricsData = await getFacebookMetrics(pageId);
        setMetrics(metricsData);

        // Create mock posts data
        const mockPosts: FacebookPost[] = [
          {
            id: '1',
            message: 'Exciting news! Our latest content strategy is showing amazing results. 🚀',
            created_time: '2024-01-15T10:30:00Z',
            impressions: 0,
            reactions: 0,
            shares: 425,
            comments: 213
          },
          {
            id: '2',
            message: 'Behind the scenes: Creating engaging content that resonates with our audience. 📸',
            created_time: '2024-01-14T15:45:00Z',
            impressions: 4231,
            reactions: 2891,
            shares: 312,
            comments: 156
          },
          {
            id: '3',
            message: 'Tips for better social media engagement - what works for us! 💡',
            created_time: '2024-01-13T09:20:00Z',
            impressions: 3876,
            reactions: 2456,
            shares: 298,
            comments: 134
          },
          {
            id: '4',
            message: 'Our community is growing! Thank you for all your support. ❤️',
            created_time: '2024-01-12T14:15:00Z',
            impressions: 3456,
            reactions: 2189,
            shares: 267,
            comments: 98
          },
          {
            id: '5',
            message: 'New insights from our latest campaign - the numbers speak for themselves! 📊',
            created_time: '2024-01-11T11:00:00Z',
            impressions: 2987,
            reactions: 1876,
            shares: 234,
            comments: 87
          }
        ];

        setPosts(mockPosts);
      } catch (error) {
        console.error('Error fetching Facebook data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Facebook posts...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with overall metrics */}
      {metrics && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">Facebook Posts Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatNumber(metrics.total_impressions)}</div>
              <div className="text-sm opacity-90">Total Impressions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatNumber(metrics.total_reactions)}</div>
              <div className="text-sm opacity-90">Total Reactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.total_posts}</div>
              <div className="text-sm opacity-90">Total Posts</div>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Posts</h2>
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-gray-900 text-lg mb-2">{post.message}</p>
                <p className="text-gray-500 text-sm">{formatDate(post.created_time)}</p>
              </div>
              <div className="ml-4 flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  #{post.id}
                </span>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">{formatNumber(post.impressions)}</div>
                <div className="text-xs text-gray-500">Impressions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{formatNumber(post.reactions)}</div>
                <div className="text-xs text-gray-500">Reactions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">{formatNumber(post.shares)}</div>
                <div className="text-xs text-gray-500">Shares</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">{formatNumber(post.comments)}</div>
                <div className="text-xs text-gray-500">Comments</div>
              </div>
            </div>

            {/* Engagement Rate */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Engagement Rate</span>
                <span className="text-sm font-semibold text-green-600">
                  {((post.reactions / post.impressions) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((post.reactions / post.impressions) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mock Data Notice */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Mock Data Mode</h3>
            <p className="text-sm text-yellow-700 mt-1">
              This is displaying mock Facebook data for testing. To see real data, configure your Facebook API credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookPostsDisplay; 