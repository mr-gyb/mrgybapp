import React from 'react';
import { RefreshCw, ExternalLink, Instagram, Twitter, Youtube, Music, Camera, TrendingUp, Sparkles } from 'lucide-react';
import { useCreationInspirations, InspirationSuggestion } from '../../hooks/useCreationInspirations';

interface CreationInspirationsNewProps {
  limit?: number;
  showRefreshButton?: boolean;
  onSuggestionsGenerated?: (suggestions: InspirationSuggestion[]) => void;
}

const CreationInspirationsNew: React.FC<CreationInspirationsNewProps> = ({ 
  limit = 3, 
  showRefreshButton = true,
  onSuggestionsGenerated
}) => {
  const { 
    suggestions, 
    isLoading, 
    error, 
    contentHubData, 
    refreshSuggestions 
  } = useCreationInspirations();

  // Notify parent component when suggestions are generated
  React.useEffect(() => {
    if (suggestions.length > 0 && onSuggestionsGenerated) {
      onSuggestionsGenerated(suggestions);
    }
  }, [suggestions, onSuggestionsGenerated]);

  // Get platform icon component
  const getPlatformIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    
    switch (platformLower) {
      case 'instagram':
        return <Instagram size={20} className="text-pink-500" />;
      case 'youtube':
        return <Youtube size={20} className="text-red-500" />;
      case 'spotify':
        return <Music size={20} className="text-green-500" />;
      case 'tiktok':
        return <Camera size={20} className="text-black" />;
      case 'pinterest':
        return <div className="w-5 h-5 bg-red-500 rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">P</span>
        </div>;
      case 'twitter':
        return <Twitter size={20} className="text-blue-400" />;
      case 'facebook':
        return <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">f</span>
        </div>;
      default:
        return <ExternalLink size={20} className="text-gray-500" />;
    }
  };

  // Get platform color classes
  const getPlatformColor = (platform: string) => {
    const platformLower = platform.toLowerCase();
    
    switch (platformLower) {
      case 'instagram':
        return 'border-pink-200 bg-pink-50 hover:bg-pink-100';
      case 'youtube':
        return 'border-red-200 bg-red-50 hover:bg-red-100';
      case 'spotify':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'tiktok':
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
      case 'pinterest':
        return 'border-red-200 bg-red-50 hover:bg-red-100';
      case 'twitter':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      case 'facebook':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      case 'explore':
        return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
      case 'resources':
        return 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100';
      case 'strategy':
        return 'border-orange-200 bg-orange-50 hover:bg-orange-100';
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: InspirationSuggestion) => {
    if (suggestion.isFallback) {
      // For fallback suggestions, open in new tab
      window.open(suggestion.url, '_blank');
    } else {
      // For regular suggestions, open in new tab
      window.open(suggestion.url, '_blank');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Creation Inspirations</h2>
          </div>
          {showRefreshButton && (
            <button
              disabled
              className="text-gray-400 cursor-not-allowed"
              title="Loading..."
            >
              <RefreshCw size={20} className="animate-spin" />
            </button>
          )}
        </div>
        
        <div className="space-y-6">
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                {/* Thumbnail skeleton */}
                <div className="w-full md:w-48 h-32 md:h-32 bg-gray-200 rounded-xl"></div>
                
                {/* Content skeleton */}
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Creation Inspirations</h2>
          </div>
          {showRefreshButton && (
            <button
              onClick={refreshSuggestions}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Refresh inspirations"
            >
              <RefreshCw size={20} />
            </button>
          )}
        </div>
        
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load inspirations</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={refreshSuggestions}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Sparkles className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Creation Inspirations</h2>
          {contentHubData && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp size={16} />
              <span>Based on your {contentHubData.userActivity.dominantType} content</span>
            </div>
          )}
        </div>
        {showRefreshButton && (
          <button
            onClick={refreshSuggestions}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Refresh inspirations"
          >
            <RefreshCw size={20} />
          </button>
        )}
      </div>

      {/* Content Hub Data Summary */}
      {contentHubData && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-blue-600 font-medium">Content Types</div>
              <div className="text-gray-700">
                {Object.entries(contentHubData.contentTypes)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([type, count]) => `${type}: ${count}`)
                  .join(', ')}
              </div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Top Platforms</div>
              <div className="text-gray-700">
                {Object.entries(contentHubData.platformDistribution)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([platform, count]) => `${platform}: ${count}`)
                  .join(', ')}
              </div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Recent Activity</div>
              <div className="text-gray-700">{contentHubData.userActivity.recentUploads} uploads (7 days)</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Engagement</div>
              <div className={`text-gray-700 capitalize ${
                contentHubData.userActivity.engagementTrend === 'increasing' ? 'text-green-600' :
                contentHubData.userActivity.engagementTrend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {contentHubData.userActivity.engagementTrend}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Grid */}
      <div className="space-y-6">
        {suggestions.slice(0, limit).map((suggestion, index) => (
          <div 
            key={suggestion.id}
            className={`group cursor-pointer transition-all duration-200 rounded-xl border-2 ${getPlatformColor(suggestion.platform)} p-6 hover:shadow-lg`}
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
              {/* Thumbnail */}
              <div className="relative flex-shrink-0 w-full md:w-48 h-32 md:h-32 rounded-xl overflow-hidden bg-gray-100">
                <img 
                  src={suggestion.thumbnail} 
                  alt={suggestion.title}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=400&fit=crop';
                  }}
                />
                
                {/* Platform badge */}
                <div className="absolute top-3 left-3 bg-white rounded-full p-2 shadow-md">
                  {getPlatformIcon(suggestion.platform)}
                </div>

                {/* Fallback indicator */}
                {suggestion.isFallback && (
                  <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Fallback
                  </div>
                )}

                {/* Play button for video platforms */}
                {['youtube', 'tiktok', 'instagram'].includes(suggestion.platform.toLowerCase()) && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black bg-opacity-70 rounded-full p-3">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {suggestion.title}
                  </h3>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {suggestion.description}
                  </p>

                  {/* Relevance explanation */}
                  <div className="mb-4 p-3 bg-blue-100 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <span className="font-medium">Why this is relevant:</span> {suggestion.relevance}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span className="font-medium">{suggestion.creator}</span>
                    <span>•</span>
                    <span className="capitalize">{suggestion.platform}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">View</span>
                    <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          AI-powered suggestions based on your content analysis • Updates automatically
        </p>
        {contentHubData && (
          <p className="text-xs text-gray-400 mt-1">
            Analyzed {contentHubData.userActivity.totalContent} content pieces • 
            {Object.keys(contentHubData.platformDistribution).length} platforms • 
            {Object.keys(contentHubData.contentTypes).length} content types
          </p>
        )}
      </div>
    </div>
  );
};

export default CreationInspirationsNew;
