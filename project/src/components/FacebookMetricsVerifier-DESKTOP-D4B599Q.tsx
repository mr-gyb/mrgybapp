import React, { useState, useEffect } from 'react';
import { getFacebookMetrics, getFacebookPostMetrics, fetchFacebookPageInsights } from '../api/services/facebook.service';

interface FacebookMetricsVerifierProps {
  className?: string;
}

const FacebookMetricsVerifier: React.FC<FacebookMetricsVerifierProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<{
    total_impressions: number;
    total_reactions: number;
    total_posts: number;
  } | null>(null);
  const [postMetrics, setPostMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if environment variables are configured
      const pageId = import.meta.env.VITE_FACEBOOK_PAGE_ID;
      const accessToken = import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN;
      
      if (!pageId || !accessToken) {
        setIsUsingMockData(true);
        console.log('⚠️ Using mock data - Facebook credentials not configured');
        console.log('To use real data, set these environment variables:');
        console.log('VITE_FACEBOOK_PAGE_ID=your_page_id');
        console.log('VITE_FACEBOOK_ACCESS_TOKEN=your_access_token');
      } else {
        setIsUsingMockData(false);
        console.log('✅ Facebook credentials found, attempting real API call');
      }

      const metricsData = await getFacebookMetrics(pageId);
      const postMetricsData = await getFacebookPostMetrics();
      
      setMetrics(metricsData);
      setPostMetrics(postMetricsData);
      
      console.log('📊 Facebook Metrics:', metricsData);
      console.log('📝 Post Metrics:', postMetricsData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('❌ Error fetching Facebook metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Facebook Metrics Verifier</h2>
        <button
          onClick={fetchMetrics}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? '🔄 Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Status Indicator */}
      <div className="mb-6">
        {isUsingMockData ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <strong>⚠️ Mock Data Mode:</strong> Facebook credentials not configured. 
            Set VITE_FACEBOOK_PAGE_ID and VITE_FACEBOOK_ACCESS_TOKEN for real data.
          </div>
        ) : (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>✅ Real Data Mode:</strong> Using configured Facebook credentials.
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Metrics Display */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Impressions</h3>
            <p className="text-3xl font-bold text-blue-600">{formatNumber(metrics.total_impressions)}</p>
            <p className="text-sm text-blue-700 mt-1">
              {isUsingMockData ? 'Mock data' : 'Real API data'}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Total Reactions</h3>
            <p className="text-3xl font-bold text-green-600">{formatNumber(metrics.total_reactions)}</p>
            <p className="text-sm text-green-700 mt-1">
              {isUsingMockData ? 'Mock data' : 'Real API data'}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Total Posts</h3>
            <p className="text-3xl font-bold text-purple-600">{metrics.total_posts}</p>
            <p className="text-sm text-purple-700 mt-1">
              {isUsingMockData ? 'Mock data' : 'Real API data'}
            </p>
          </div>
        </div>
      )}

      {/* Detailed Post Metrics */}
      {postMetrics && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Post Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Post Impressions</p>
              <p className="text-lg font-semibold">{formatNumber(postMetrics.post_impressions)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reactions</p>
              <p className="text-lg font-semibold">{formatNumber(postMetrics.post_reactions_by_type_total)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Likes</p>
              <p className="text-lg font-semibold">{formatNumber(postMetrics.post_reactions_like_total)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Loves</p>
              <p className="text-lg font-semibold">{formatNumber(postMetrics.post_reactions_love_total)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Shares</p>
              <p className="text-lg font-semibold">{formatNumber(postMetrics.post_shares)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Comments</p>
              <p className="text-lg font-semibold">{formatNumber(postMetrics.post_comments)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Clicks</p>
              <p className="text-lg font-semibold">{formatNumber(postMetrics.post_clicks)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Other Reactions</p>
              <p className="text-lg font-semibold">
                {formatNumber(
                  postMetrics.post_reactions_wow_total + 
                  postMetrics.post_reactions_haha_total + 
                  postMetrics.post_reactions_sorry_total + 
                  postMetrics.post_reactions_anger_total
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Verification Instructions */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">How to Verify Real Data</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong>1. Set Environment Variables:</strong>
            <p className="ml-4 mt-1">
              Create a <code>.env</code> file in your project root with:
            </p>
            <pre className="ml-4 mt-2 bg-gray-100 p-2 rounded text-xs">
{`VITE_FACEBOOK_PAGE_ID=your_facebook_page_id
VITE_FACEBOOK_ACCESS_TOKEN=your_facebook_access_token`}
            </pre>
          </div>
          
          <div>
            <strong>2. Get Facebook Credentials:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Create a Facebook App in Facebook Developers Console</li>
              <li>• Get your Page ID from your Facebook Page settings</li>
              <li>• Generate a Page Access Token with required permissions</li>
              <li>• Required permissions: pages_read_engagement, pages_manage_posts</li>
            </ul>
          </div>
          
          <div>
            <strong>3. Check Console Logs:</strong>
            <p className="ml-4 mt-1">
              Open browser console (F12) to see detailed API responses and verify data authenticity.
            </p>
          </div>
          
          <div>
            <strong>4. Compare with Facebook Insights:</strong>
            <p className="ml-4 mt-1">
              Compare the numbers shown here with your Facebook Page Insights dashboard to verify accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookMetricsVerifier; 