import React, { useState } from 'react';
import { getFacebookPostMetrics } from '../api/services/facebook.service';

const FacebookMetricsExample: React.FC = () => {
  const [postId, setPostId] = useState('');
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    if (!postId) {
      setError('Please enter a Post ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMetrics(null);

    try {
      const result = await getFacebookPostMetrics(postId);
      
      if (result) {
        setMetrics(result);
        setError(null);
      } else {
        setError('Failed to fetch metrics');
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Facebook Metrics Example</h2>
      
      <div className="mb-6">
        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold mb-2">Updated Configuration:</h3>
          <p className="text-sm">
            <strong>Access Token:</strong> Pre-configured with your token
          </p>
          <p className="text-sm">
            <strong>Fields Fetched:</strong> Only post_impressions and post_reactions_by_type_total
          </p>
          <p className="text-sm">
            <strong>API Version:</strong> v18.0
          </p>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facebook Post ID
          </label>
          <input
            type="text"
            value={postId}
            onChange={(e) => setPostId(e.target.value)}
            placeholder="123456789_123456789"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a valid Facebook post ID to fetch metrics
          </p>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={fetchMetrics}
          disabled={isLoading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Fetching...' : 'Get Metrics'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {metrics && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Facebook Post Metrics:</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-sm text-blue-600 font-medium">Post Impressions</div>
              <div className="text-2xl font-bold text-blue-800">{metrics.post_impressions.toLocaleString()}</div>
            </div>
            
            <div className="bg-green-50 p-3 rounded">
              <div className="text-sm text-green-600 font-medium">Total Reactions</div>
              <div className="text-2xl font-bold text-green-800">{metrics.post_reactions_by_type_total.toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded mb-4">
            <h4 className="font-semibold mb-2">Reaction Breakdown (Estimated):</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>Likes: {metrics.post_reactions_like_total.toLocaleString()}</div>
              <div>Love: {metrics.post_reactions_love_total.toLocaleString()}</div>
              <div>Wow: {metrics.post_reactions_wow_total.toLocaleString()}</div>
              <div>Haha: {metrics.post_reactions_haha_total.toLocaleString()}</div>
              <div>Sorry: {metrics.post_reactions_sorry_total.toLocaleString()}</div>
              <div>Anger: {metrics.post_reactions_anger_total.toLocaleString()}</div>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <p><strong>Note:</strong> Only post_impressions and post_reactions_by_type_total are fetched from the API.</p>
            <p>Reaction breakdown is estimated based on typical Facebook engagement patterns.</p>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">API Integration Details:</h3>
        <ul className="text-sm space-y-1">
          <li>• Uses your provided access token: 432001285103240|H5xN5v-szxHTgjwZ6gjK3FS-m5g</li>
          <li>• Fetches only post_impressions and post_reactions_by_type_total fields</li>
          <li>• Updated in platform-apis.service.ts and facebook.service.ts</li>
          <li>• Ready for integration with your content tracking system</li>
        </ul>
      </div>
    </div>
  );
};

export default FacebookMetricsExample; 