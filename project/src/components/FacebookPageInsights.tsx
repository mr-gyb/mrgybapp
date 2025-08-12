import React, { useState, useEffect } from 'react';
import { fetchFacebookPageInsightsMetrics } from '../api/services/facebook.service';

interface FacebookPageInsightsData {
  total_impressions: number;
  total_reactions: number;
  posts: Array<{
    post_id: string;
    post_impressions: number;
    post_reactions_by_type_total: number;
    created_time: string;
  }>;
}

const FacebookPageInsights: React.FC = () => {
  const [pageId, setPageId] = useState('');
  const [insightsData, setInsightsData] = useState<FacebookPageInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    if (!pageId) {
      setError('Please enter a Page ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    setInsightsData(null);

    try {
      const result = await fetchFacebookPageInsightsMetrics(pageId);
      
      if (result) {
        setInsightsData(result);
        setError(null);
      } else {
        setError('Failed to fetch Facebook Page Insights');
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Facebook Page Insights</h2>
      
      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold mb-2">Configuration:</h3>
          <p className="text-sm">
            <strong>Access Token:</strong> Pre-configured with your token
          </p>
          <p className="text-sm">
            <strong>Metrics Fetched:</strong> post_impressions → Total Impressions, post_reactions_by_type_total → Total Reactions
          </p>
          <p className="text-sm">
            <strong>API Version:</strong> v18.0
          </p>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facebook Page ID
          </label>
          <input
            type="text"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            placeholder="123456789"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your Facebook Page ID (numeric only)
          </p>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={fetchInsights}
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Fetching Insights...' : 'Get Page Insights'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {insightsData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
              <div className="text-sm font-medium opacity-90">Total Impressions</div>
              <div className="text-3xl font-bold">{insightsData.total_impressions.toLocaleString()}</div>
              <div className="text-xs opacity-75 mt-1">From post_impressions metric</div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
              <div className="text-sm font-medium opacity-90">Total Reactions</div>
              <div className="text-3xl font-bold">{insightsData.total_reactions.toLocaleString()}</div>
              <div className="text-xs opacity-75 mt-1">From post_reactions_by_type_total metric</div>
            </div>
          </div>

          {/* Posts Table */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Individual Post Metrics</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Post ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impressions
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reactions
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engagement Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {insightsData.posts.map((post, index) => {
                    const engagementRate = post.post_impressions > 0 
                      ? ((post.post_reactions_by_type_total / post.post_impressions) * 100).toFixed(2)
                      : '0.00';
                    
                    return (
                      <tr key={post.post_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                          {post.post_id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDate(post.created_time)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {post.post_impressions.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {post.post_reactions_by_type_total.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            parseFloat(engagementRate) > 5 ? 'bg-green-100 text-green-800' :
                            parseFloat(engagementRate) > 2 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {engagementRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Mapping Explanation */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Data Mapping:</h4>
            <ul className="text-sm space-y-1">
              <li>• <strong>post_impressions</strong> → <strong>Total Impressions</strong>: Number of times posts were seen</li>
              <li>• <strong>post_reactions_by_type_total</strong> → <strong>Total Reactions</strong>: Total likes, loves, wows, hahas, sorrys, and angers</li>
              <li>• <strong>Engagement Rate</strong>: (Reactions / Impressions) × 100</li>
            </ul>
          </div>

          {/* API Details */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">API Implementation Details:</h4>
            <ul className="text-sm space-y-1">
              <li>• Uses your access token: 432001285103240|H5xN5v-szxHTgjwZ6gjK3FS-m5g</li>
              <li>• Fetches up to 100 posts from the page</li>
              <li>• Maps Facebook metrics to UI-friendly labels</li>
              <li>• Calculates engagement rates automatically</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacebookPageInsights; 