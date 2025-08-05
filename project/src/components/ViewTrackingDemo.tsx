import React, { useState } from 'react';
import { RefreshCw, TrendingUp, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { updateViewCounts, ViewUpdateResult, PlatformViewData } from '../services/viewTracking.service';
import { ContentItem } from '../types/content';

interface ViewTrackingDemoProps {
  contentItem: ContentItem;
  onUpdate?: (updatedContent: ContentItem) => void;
}

const ViewTrackingDemo: React.FC<ViewTrackingDemoProps> = ({ contentItem, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateResults, setUpdateResults] = useState<ViewUpdateResult[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const handleUpdateViews = async () => {
    setIsUpdating(true);
    setUpdateResults([]);

    try {
      const results = await updateViewCounts(contentItem);
      setUpdateResults(results);
      setLastUpdated(new Date().toISOString());

      // Calculate total views from all platforms
      const totalViews = results.reduce((sum, result) => sum + result.views, 0);
      
      // Create updated content item with new view count
      const updatedContent: ContentItem = {
        ...contentItem,
        views: totalViews
      };

      if (onUpdate) {
        onUpdate(updatedContent);
      }

    } catch (error) {
      console.error('Error updating view counts:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return '🎥';
      case 'instagram':
        return '📷';
      case 'tiktok':
        return '🎵';
      case 'facebook':
        return '📘';
      case 'pinterest':
        return '📌';
      case 'spotify':
        return '🎵';
      case 'blog':
        return '📝';
      default:
        return '🌐';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">View Tracking</h3>
        <button
          onClick={handleUpdateViews}
          disabled={isUpdating}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <TrendingUp className="w-4 h-4" />
          )}
          <span>{isUpdating ? 'Updating...' : 'Update Views'}</span>
        </button>
      </div>

      {/* Current View Count */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-gray-600" />
          <span className="font-medium">Current Total Views:</span>
          <span className="text-2xl font-bold text-blue-600">{contentItem.views || 0}</span>
        </div>
        {lastUpdated && (
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
      </div>

      {/* Platform Breakdown */}
      {contentItem.platforms && contentItem.platforms.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Platforms:</h4>
          <div className="flex flex-wrap gap-2">
            {contentItem.platforms.map((platform) => (
              <span
                key={platform}
                className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                <span>{getPlatformIcon(platform)}</span>
                <span className="capitalize">{platform}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Update Results */}
      {updateResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Update Results:</h4>
          {updateResults.map((result, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${
                result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                {result.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="font-medium capitalize">{result.platform}</span>
                <span className="text-sm text-gray-500">
                  {result.success ? `${result.views.toLocaleString()} views` : 'Failed'}
                </span>
              </div>
              {!result.success && result.error && (
                <span className="text-xs text-red-600">{result.error}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* API Information */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium">
          Platform API Information
        </summary>
        <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm">
          <h5 className="font-medium mb-2">Available APIs:</h5>
          <ul className="space-y-1 text-gray-600">
            <li>✅ YouTube Data API v3 - View counts, likes, comments</li>
            <li>✅ Instagram Basic Display API - Engagement metrics</li>
            <li>✅ TikTok for Developers - Play counts, engagement</li>
            <li>✅ Facebook Graph API - Post impressions, reach</li>
            <li>✅ Pinterest API - Save counts, engagement</li>
            <li>✅ Spotify Web API - Popularity scores</li>
            <li>✅ Google Analytics API - Blog/website views</li>
            <li>❌ Apple Podcasts - No public API available</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            Note: This demo uses mock data. Real implementation requires API keys and authentication for each platform.
          </p>
        </div>
      </details>
    </div>
  );
};

export default ViewTrackingDemo; 