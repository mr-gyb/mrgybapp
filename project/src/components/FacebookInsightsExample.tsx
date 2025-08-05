import React, { useState } from 'react';
import { useFacebookPageInsights } from '../hooks/useFacebookPageInsights';

const FacebookInsightsExample: React.FC = () => {
  const [pageId, setPageId] = useState('');
  const { data, isLoading, error, fetchInsights, clearData } = useFacebookPageInsights();

  const handleFetch = () => {
    fetchInsights(pageId);
  };

  const handleClear = () => {
    clearData();
    setPageId('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Facebook Page Insights Example</h2>
      
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
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleFetch}
          disabled={isLoading || !pageId}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Fetching...' : 'Get Insights'}
        </button>
        
        <button
          onClick={handleClear}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Total Impressions</div>
              <div className="text-2xl font-bold text-blue-800">
                {data.total_impressions.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Mapped from post_impressions
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Total Reactions</div>
              <div className="text-2xl font-bold text-green-800">
                {data.total_reactions.toLocaleString()}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Mapped from post_reactions_by_type_total
              </div>
            </div>
          </div>

          {/* Posts Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Posts Summary</h3>
            <div className="text-sm text-gray-600">
              <p>• Total Posts Analyzed: {data.posts.length}</p>
              <p>• Average Impressions per Post: {Math.round(data.total_impressions / data.posts.length).toLocaleString()}</p>
              <p>• Average Reactions per Post: {Math.round(data.total_reactions / data.posts.length).toLocaleString()}</p>
              <p>• Overall Engagement Rate: {((data.total_reactions / data.total_impressions) * 100).toFixed(2)}%</p>
            </div>
          </div>

          {/* Data Mapping Info */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Data Mapping:</h4>
            <ul className="text-sm space-y-1">
              <li>• <strong>post_impressions</strong> → <strong>Total Impressions</strong></li>
              <li>• <strong>post_reactions_by_type_total</strong> → <strong>Total Reactions</strong></li>
              <li>• Data is aggregated across all posts on the page</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacebookInsightsExample; 