import React, { useState } from 'react';

const FacebookAPITester: React.FC = () => {
  const [pageId, setPageId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    if (!pageId || !accessToken) {
      setError('Please enter both Page ID and Access Token');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test basic page info first
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}?access_token=${accessToken}`
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

  const testInsights = async () => {
    if (!pageId || !accessToken) {
      setError('Please enter both Page ID and Access Token');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/insights?metric=page_impressions&period=day&access_token=${accessToken}`
      );
      
      const data = await response.json();
      
      if (data.error) {
        setError(`Insights Error: ${data.error.message} (Code: ${data.error.code})`);
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
      <h2 className="text-2xl font-bold mb-6">Facebook API Tester</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page ID (numeric only)
          </label>
          <input
            type="text"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            placeholder="123456789"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Access Token
          </label>
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="EAABwzLixnjYBO..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={testAPI}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Page Info'}
        </button>
        
        <button
          onClick={testInsights}
          disabled={isLoading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Insights'}
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
        </div>
      )}

      <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Troubleshooting Tips:</h3>
        <ul className="text-sm space-y-1">
          <li>• Page ID should be numeric (e.g., 123456789)</li>
          <li>• Access Token should start with "EAAB" for Page Access Token</li>
          <li>• Ensure your app has required permissions</li>
          <li>• Check if the token is expired</li>
          <li>• Verify the page exists and you have admin access</li>
        </ul>
      </div>
    </div>
  );
};

export default FacebookAPITester; 