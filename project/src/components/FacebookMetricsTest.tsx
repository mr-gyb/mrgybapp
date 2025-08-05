import React, { useState } from 'react';

const FacebookMetricsTest: React.FC = () => {
  const [postId, setPostId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Your provided access token
  const accessToken = '432001285103240|H5xN5v-szxHTgjwZ6gjK3FS-m5g';

  const testPostMetrics = async () => {
    if (!postId) {
      setError('Please enter a Post ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Fetch only the two specific fields: post_impressions and post_reactions_by_type_total
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${postId}?fields=insights.metric(post_impressions,post_reactions_by_type_total)&access_token=${accessToken}`
      );
      
      const data = await response.json();
      
      if (data.error) {
        setError(`API Error: ${data.error.message} (Code: ${data.error.code})`);
        setResult(data);
      } else {
        setResult(data);
        setError(null);
      }
    } catch (err) {
      setError(`Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Facebook Metrics Test</h2>
      
      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold mb-2">Configuration:</h3>
          <p className="text-sm">
            <strong>Access Token:</strong> {accessToken.substring(0, 20)}...
          </p>
          <p className="text-sm">
            <strong>Fields:</strong> post_impressions, post_reactions_by_type_total
          </p>
          <p className="text-sm">
            <strong>API Version:</strong> v18.0
          </p>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post ID
          </label>
          <input
            type="text"
            value={postId}
            onChange={(e) => setPostId(e.target.value)}
            placeholder="123456789_123456789"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the Facebook post ID (e.g., 123456789_123456789)
          </p>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={testPostMetrics}
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Fetching Metrics...' : 'Get Post Metrics'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">API Response:</h3>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
          
          {result.insights && (
            <div className="mt-4 bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Extracted Metrics:</h4>
              <ul className="text-sm space-y-1">
                {result.insights.data.map((insight: any, index: number) => (
                  <li key={index}>
                    <strong>{insight.name}:</strong> {insight.values?.[0]?.value || 'N/A'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
        <ul className="text-sm space-y-1">
          <li>• Enter a valid Facebook post ID</li>
          <li>• The API will fetch only post_impressions and post_reactions_by_type_total</li>
          <li>• Make sure the post is public or you have access to it</li>
          <li>• The access token is pre-configured</li>
        </ul>
      </div>
    </div>
  );
};

export default FacebookMetricsTest; 