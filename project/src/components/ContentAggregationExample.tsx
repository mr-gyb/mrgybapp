import React from 'react';
import { useContentAggregation } from '../hooks/useContentAggregation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ContentAggregationExample: React.FC = () => {
  const { aggregation, metadata, isLoading, error, refreshAggregation } = useContentAggregation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-navy-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button 
          onClick={refreshAggregation}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Transform data for chart display
  const chartData = aggregation.map(item => ({
    type: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    views: item.views
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Content Analytics</h2>
      
      {/* Summary Statistics */}
      {metadata && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm text-blue-600 mb-1">Total Views</h3>
            <p className="text-2xl font-bold text-blue-800">{metadata.totalViews.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm text-green-600 mb-1">Total Content</h3>
            <p className="text-2xl font-bold text-green-800">{metadata.totalContent}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm text-purple-600 mb-1">Content Types</h3>
            <p className="text-2xl font-bold text-purple-800">{metadata.contentTypes}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-sm text-orange-600 mb-1">Avg Views</h3>
            <p className="text-2xl font-bold text-orange-800">
              {metadata.totalContent > 0 ? Math.round(metadata.totalViews / metadata.totalContent) : 0}
            </p>
          </div>
        </div>
      )}

      {/* Content Type Breakdown */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Views by Content Type</h3>
        {aggregation.length > 0 ? (
          <div className="space-y-2">
            {aggregation.map((item, index) => (
              <div key={item.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="font-medium capitalize">{item.type}</span>
                </div>
                <span className="text-lg font-bold">{item.views.toLocaleString()} views</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No content data available</p>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Views Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip formatter={(value) => [value.toLocaleString(), 'Views']} />
              <Legend />
              <Bar dataKey="views" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Raw Data Display */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
          Show Raw Data
        </summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
          {JSON.stringify(aggregation, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default ContentAggregationExample; 