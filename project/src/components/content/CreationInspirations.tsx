import React, { useEffect, useState } from 'react';
import { TrendingUp, RefreshCw, ExternalLink, Instagram, Twitter, Youtube, Sparkles } from 'lucide-react';
import { useSocialMediaContent } from '../../hooks/useSocialMediaContent';
import { SocialMediaPost } from '../../api/services/social-media.service';
import { useUserContent } from '../../hooks/useUserContent';
import { getCreationInspirationsOpenAI } from '../../services/content/analysis.service';
import { useCreationInspirations, InspirationSuggestion } from '../../hooks/useCreationInspirations';
import HighPerformingPosts from './HighPerformingPosts';

interface CreationInspirationsProps {
  limit?: number;
  showRefreshButton?: boolean;
  onSuggestionsGenerated?: (suggestions: { title: string; explanation: string; url: string; image: string }[] | InspirationSuggestion[]) => void;
  useNewSystem?: boolean; // Toggle between old and new system
}

const CreationInspirations: React.FC<CreationInspirationsProps> = ({ 
  limit = 3, 
  showRefreshButton = true,
  onSuggestionsGenerated,
  useNewSystem = true // Default to new system
}) => {
  const { posts, isLoading: isPostsLoading, error: postsError, refreshPosts } = useSocialMediaContent(limit * 2); // fetch more for filtering
  const { content: userContent } = useUserContent();

  // New Creation Inspirations system
  const { 
    suggestions: newSuggestions, 
    isLoading: isNewLoading, 
    error: newError, 
    contentHubData, 
    refreshSuggestions: refreshNewSuggestions 
  } = useCreationInspirations();

  // --- OpenAI suggestions integration ---
  const [aiSuggestions, setAiSuggestions] = useState<{ title: string; explanation: string; url: string; image: string }[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Helper to parse suggestions with links from OpenAI response
  function parseSuggestionsWithLinks(text: string): { text: string; url?: string }[] {
    // Expecting format: 1. Title - Description (link: https://...)
    return text.split(/\n|\r/)
      .map(line => {
        const match = line.match(/^(?:\d+\.|-)?\s*(.*?)(?:\s*\(link:\s*(https?:\/\/[^)]+)\))?$/i);
        if (match) {
          return { text: match[1].trim(), url: match[2] };
        }
        return null;
      })
      .filter(Boolean) as { text: string; url?: string }[];
  }

  // Helper to parse suggestions with title, explanation, link, and image
  function parseSuggestionsWithImage(text: string): { title: string; explanation: string; url: string; image: string }[] {
    // Expecting format: 1. **Title**: Explanation (link: https://...) (image: https://...)
    return text.split(/\n|\r/)
      .map(line => {
        // Match: **Title**: Explanation (link: ...) (image: ...)
        const match = line.match(/\*\*(.*?)\*\*[:\-]?\s*(.*?)(?:\(link:\s*(https?:\/\/[^)]+)\))?(?:\s*\(image:\s*(https?:\/\/[^)]+)\))?$/i);
        let title = '', explanation = '', url = '', image = '';
        if (match) {
          title = match[1]?.trim() || '';
          explanation = match[2]?.trim() || '';
          url = match[3]?.trim() || '';
          image = match[4]?.trim() || '';
        }
        // Fallback: try to extract link/image from explanation if missing
        if (!url) {
          const linkMatch = explanation.match(/https?:\/\/[^\s)]+/);
          if (linkMatch) url = linkMatch[0];
        }
        if (!image) {
          const imgMatch = explanation.match(/https?:\/\/[^\s)]+\.(jpg|jpeg|png|webp)/);
          if (imgMatch) image = imgMatch[0];
        }
        // Fallback: use a default image if still missing
        if (!image) image = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
        return title ? { title, explanation, url, image } : null;
      })
      .filter(Boolean) as { title: string; explanation: string; url: string; image: string }[];
  }

  // Fetch AI suggestions (with links)
  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const suggestionsText = await getCreationInspirationsOpenAI(
        userContent.filter((item: any) => !item.id.startsWith('default-')),
        true // withLinks
      );
      if (suggestionsText === 'timeout') {
        setError('AI suggestions are taking longer than expected. Showing trending content instead.');
        setAiSuggestions(null);
        // Optionally, trigger trending content fallback here
      } else {
        const parsedSuggestions = parseSuggestionsWithImage(suggestionsText);
        setAiSuggestions(parsedSuggestions);
        // Pass suggestions to parent component
        if (onSuggestionsGenerated) {
          onSuggestionsGenerated(parsedSuggestions);
        }
      }
    } catch (err) {
      setError('Failed to generate AI suggestions. Showing trending content instead.');
      setAiSuggestions(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh handler for button
  const handleRefresh = () => {
    if (useNewSystem) {
      refreshNewSuggestions();
    } else {
      setAiSuggestions(null);
      setRefreshKey(k => k + 1);
      fetchSuggestions();
      refreshPosts();
    }
  };

  // Notify parent component when new suggestions are generated
  useEffect(() => {
    if (useNewSystem && newSuggestions.length > 0 && onSuggestionsGenerated) {
      onSuggestionsGenerated(newSuggestions);
    }
  }, [newSuggestions, onSuggestionsGenerated, useNewSystem]);

  useEffect(() => {
    if (!useNewSystem) {
      fetchSuggestions();
    }
  }, [userContent, refreshKey, useNewSystem]);

  // Grouping logic for content types
  const groupContentType = (item: any) => {
    if (item.type === 'written') return 'Blogs';
    if (item.type === 'audio') return 'Audio';
    if (item.type === 'video') return 'Video';
    if (item.type === 'photo') {
      if (item.platforms && item.platforms.some((p: any) => ['Instagram', 'Pinterest', 'Facebook'].includes(p))) {
        return 'Social Media';
      }
    }
            if (item.platforms && item.platforms.some((p: any) => ['Newsletter', 'Other'].includes(p))) {
      return 'Other';
    }
    return 'Other';
  };

  // Analyze user content to find dominant type
  const typeCounts = userContent.reduce((acc: Record<string, number>, item: any) => {
    const group = groupContentType(item);
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // Map social media post platform/type to our groups
  const mapPostToGroup = (post: any) => {
    if (post.platform === 'instagram' || post.platform === 'facebook' || post.platform === 'pinterest') return 'Social Media';
            if (post.platform === 'twitter' || post.platform === 'newsletter') return 'Other';
    if (post.platform === 'spotify' || post.platform === 'soundcloud') return 'Audio';
    if (post.platform === 'blog' || post.platform === 'medium') return 'Blogs';
    if (post.platform === 'youtube') return 'Video';
    return 'Other';
  };

  // Filter and rank posts to match dominant type
  let personalizedPosts = posts;
  if (dominantType) {
    personalizedPosts = posts.filter((post) => mapPostToGroup(post) === dominantType);
    if (personalizedPosts.length < limit) {
      // If not enough, fill with other posts
      personalizedPosts = personalizedPosts.concat(posts.filter((post) => mapPostToGroup(post) !== dominantType));
    }
    personalizedPosts = personalizedPosts.slice(0, limit);
  } else {
    personalizedPosts = posts.slice(0, limit);
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram size={16} className="text-pink-500" />;
      case 'twitter':
        return <Twitter size={16} className="text-blue-400" />;
      case 'youtube':
        return <Youtube size={16} className="text-red-500" />;
      case 'tiktok':
        return <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">T</span>
        </div>;
      default:
        return <ExternalLink size={16} className="text-gray-500" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'border-pink-200 bg-pink-50';
      case 'twitter':
        return 'border-blue-200 bg-blue-50';
      case 'youtube':
        return 'border-red-200 bg-red-50';
      case 'tiktok':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  // NEW SYSTEM: Show new Creation Inspirations
  if (useNewSystem) {
    if (isNewLoading) {
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
                  <div className="w-full md:w-48 h-32 md:h-32 bg-gray-200 rounded-xl"></div>
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

    if (newError) {
      return (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Sparkles className="text-blue-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Creation Inspirations</h2>
            </div>
            {showRefreshButton && (
              <button
                onClick={refreshNewSuggestions}
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
            <p className="text-gray-500 mb-4">{newError}</p>
            <button
              onClick={refreshNewSuggestions}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // Show new suggestions
    if (newSuggestions && newSuggestions.length > 0) {
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
                onClick={refreshNewSuggestions}
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

          {/* High-Performing Posts Section */}
          <div className="mb-6">
            <HighPerformingPosts 
              showRefreshButton={true}
              onRefresh={refreshNewSuggestions}
            />
          </div>

          {/* New Suggestions Grid */}
          <div className="space-y-6">
            {newSuggestions.slice(0, limit).map((suggestion, index) => (
              <div 
                key={suggestion.id}
                className="group cursor-pointer transition-all duration-200 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 p-6 hover:shadow-lg"
                onClick={() => window.open(suggestion.url, '_blank')}
              >
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 w-full md:w-48 h-32 md:h-32 rounded-xl overflow-hidden bg-blue-200">
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
                      <span className="text-sm font-medium text-gray-700">{suggestion.platform}</span>
                    </div>

                    {/* Fallback indicator */}
                    {suggestion.isFallback && (
                      <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        Fallback
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
    }
  }

  // If loading AI suggestions
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Creation Inspirations</h2>
        </div>
        <div className="space-y-4">
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg animate-pulse">
              <div className="text-2xl font-bold text-gray-300">{index + 1}</div>
              <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-grow space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If AI suggestions are available
  if (aiSuggestions && aiSuggestions.length > 0) {
    // Filter out empty suggestions
    const validSuggestions = aiSuggestions.filter(s => s.title && s.title.trim().length > 0);
    const topSuggestions = validSuggestions.slice(0, 3);
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Creation Inspirations</h2>
          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Refresh inspirations"
            >
              <RefreshCw size={20} />
            </button>
          )}
        </div>
        <div className="space-y-6">
          {topSuggestions.map((suggestion, index) => (
            <div key={index} className="group flex flex-col md:flex-row items-stretch md:items-start space-y-4 md:space-y-0 md:space-x-6 p-6 rounded-2xl border border-blue-100 bg-blue-50 hover:shadow-xl transition-shadow relative">
              <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {/* Placeholder for Like/Save buttons */}
                <button className="bg-white rounded-full shadow p-2 hover:bg-blue-100" title="Like">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z"/></svg>
                </button>
                <button className="bg-white rounded-full shadow p-2 hover:bg-green-100" title="Save">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </button>
              </div>
              <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-xl bg-blue-200 flex items-center justify-center overflow-hidden">
                {suggestion.image ? (
                  <img 
                    src={suggestion.image} 
                    alt={suggestion.title} 
                    className="w-full h-full object-cover rounded-xl"
                    onError={e => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-2xl bg-blue-100">{index + 1}</div>
                )}
              </div>
              <div className="flex-grow min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold mb-2 text-lg line-clamp-2">{suggestion.title}</h3>
                  <div className="text-sm text-gray-700 mb-1">{suggestion.explanation}</div>
                  {suggestion.url ? (
                    <button 
                      className="text-blue-700 underline text-xs font-medium hover:text-blue-800"
                      onClick={(e) => {
                        e.preventDefault();
                        // Show a confirmation dialog with actionable options
                        const userChoice = confirm(
                          'This is a demonstration link. Would you like to:\n\n' +
                          '• Create content based on this suggestion\n' +
                          '• Save this idea for later\n' +
                          '• View similar examples\n\n' +
                          'Click OK to create content, Cancel to save for later.'
                        );
                        
                        if (userChoice) {
                          // User clicked OK - create content based on suggestion
                          alert('Great choice! Redirecting to content creation...\n\nIn a real app, this would open the content creation form with this suggestion pre-filled.');
                          // Here you could navigate to content creation or open a modal
                        } else {
                          // User clicked Cancel - save for later
                          alert('Suggestion saved! You can find it in your saved ideas later.\n\nIn a real app, this would be added to your bookmarks or saved items.');
                        }
                      }}
                    >
                      Learn more
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">No link available</span>
                  )}
                </div>
                <div className="mt-2">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Personalized</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Personalized by AI based on your content strengths
          </p>
        </div>

        {/* High-Performing Posts Section */}
        <div className="mt-6">
          <HighPerformingPosts 
            showRefreshButton={true}
            onRefresh={handleRefresh}
          />
        </div>
      </div>
    );
  }

  // If error or fallback, show trending content (original logic)
  if (isPostsLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Creation Inspirations</h2>
          {showRefreshButton && (
            <button
              onClick={refreshPosts}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled
            >
              <RefreshCw size={20} className="animate-spin" />
            </button>
          )}
        </div>
        <div className="space-y-4">
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg animate-pulse">
              <div className="text-2xl font-bold text-gray-300">{index + 1}</div>
              <div className="relative w-24 h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {/* Only show a placeholder image with overlays for video/audio if desired */}
                <img 
                  src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                  alt="Placeholder" 
                  className="w-full h-full object-cover rounded-lg opacity-60" 
                />
                {/* Example: overlay play icon for video, audio icon for tiktok */}
                {index === 2 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-60 rounded-full p-3">
                      <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                )}
                {index === 1 && (
                  <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded-full p-2">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M9 17v-2a4 4 0 0 1 8 0v2"/><rect x="5" y="9" width="14" height="10" rx="2"/><circle cx="12" cy="13" r="1"/></svg>
                  </div>
                )}
              </div>
              <div className="flex-grow space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (postsError) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-bold mb-4">Creation Inspirations</h2>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">{postsError}</p>
          <button
            onClick={refreshPosts}
            className="bg-navy-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (personalizedPosts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-bold mb-4">Creation Inspirations</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No trending content available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Creation Inspirations</h2>
        {showRefreshButton && (
          <button
            onClick={refreshPosts}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Refresh inspirations"
          >
            <RefreshCw size={20} />
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {personalizedPosts.map((post, index) => {
          // Determine if this is a video or audio post based on platform
          const isVideo = post.platform === 'youtube';
          const isAudio = post.platform === 'tiktok'; // Stand-in for audio, since no audio_url
          return (
            <div 
              key={post.id} 
              className={`group flex flex-col md:flex-row items-stretch md:items-start space-y-4 md:space-y-0 md:space-x-6 p-6 rounded-2xl border ${getPlatformColor(post.platform)} hover:shadow-xl transition-shadow cursor-pointer relative`} 
              onClick={() => window.open(post.url, '_blank')}
              style={{ minHeight: '180px' }}
            >
              <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {/* Placeholder for Like/Save buttons */}
                <button className="bg-white rounded-full shadow p-2 hover:bg-blue-100" title="Like">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z"/></svg>
                </button>
                <button className="bg-white rounded-full shadow p-2 hover:bg-green-100" title="Save">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </button>
              </div>
              <div className="relative flex-shrink-0 w-full md:w-48 h-40 md:h-48 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {/* Media preview logic based on platform */}
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
                  }}
                />
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-60 rounded-full p-3">
                      <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                )}
                {isAudio && (
                  <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded-full p-2">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M9 17v-2a4 4 0 0 1 8 0v2"/><rect x="5" y="9" width="14" height="10" rx="2"/><circle cx="12" cy="13" r="1"/></svg>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  {getPlatformIcon(post.platform)}
                </div>
              </div>
              <div className="flex-grow min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold mb-2 text-lg line-clamp-2">{post.title}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <TrendingUp size={14} className="mr-1" />
                        <span>{post.views}</span>
                      </div>
                      <span>•</span>
                      <span>{post.likes}</span>
                      {post.engagement_rate && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 font-medium">
                            {post.engagement_rate.toFixed(1)}% engagement
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-xs">{formatTimeAgo(post.timestamp)}</span>
                  </div>
                </div>
                {/* Placeholder for future badges or explanations */}
                <div className="mt-2">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Trending</span>
                </div>
              </div>
            </div>
        );})}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Trending content from social media platforms • Updates every hour
        </p>
      </div>
    </div>
  );
};

export default CreationInspirations; 