import React, { useEffect, useState, lazy, Suspense } from 'react';
import { TrendingUp, RefreshCw, ExternalLink, Instagram, Twitter, Youtube, Sparkles, BarChart3, Target } from 'lucide-react';
import { useSocialMediaContent } from '../../hooks/useSocialMediaContent';
import { SocialMediaPost } from '../../api/services/social-media.service';
import { useUserContent } from '../../hooks/useUserContent';
import { getCreationInspirationsOpenAI } from '../../services/content/analysis.service';
import HighPerformingPosts from './HighPerformingPosts';

interface CreationInspirationsLazyProps {
  limit?: number;
  showRefreshButton?: boolean;
  onSuggestionsGenerated?: (suggestions: { title: string; explanation: string; url: string; image: string }[]) => void;
}

interface ContentAnalysis {
  userTrends: string[];
  contentGaps: string[];
  platformStrengths: string[];
  audienceInsights: string[];
}

interface EnhancedSuggestion {
  title: string;
  explanation: string;
  url: string;
  image: string;
  platform: string;
  contentType: string;
  estimatedEngagement: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeToCreate: string;
  tags: string[];
}

const CreationInspirationsLazy: React.FC<CreationInspirationsLazyProps> = ({ 
  limit = 3, 
  showRefreshButton = true,
  onSuggestionsGenerated
}) => {
  const { posts, isLoading: isPostsLoading, error: postsError, refreshPosts } = useSocialMediaContent(limit * 2);
  const { content: userContent } = useUserContent();

  // Enhanced state for AI-powered suggestions
  const [aiSuggestions, setAiSuggestions] = useState<EnhancedSuggestion[] | null>(null);
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [analysisMode, setAnalysisMode] = useState<'basic' | 'advanced'>('basic');

  // Analyze user's content patterns and trends
  const analyzeUserContent = (): ContentAnalysis => {
    const trends: string[] = [];
    const gaps: string[] = [];
    const strengths: string[] = [];
    const insights: string[] = [];

    // Analyze content types
    const contentTypeCounts: Record<string, number> = {};
    const platformCounts: Record<string, number> = {};
    const engagementData: number[] = [];

    userContent.forEach(item => {
      // Count content types
      contentTypeCounts[item.type] = (contentTypeCounts[item.type] || 0) + 1;
      
      // Count platforms
      if (item.platforms) {
        item.platforms.forEach(platform => {
          platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        });
      }
      
      // Collect engagement data
      if (item.engagement) {
        engagementData.push(item.engagement);
      }
    });

    // Identify trends
    const sortedTypes = Object.entries(contentTypeCounts)
      .sort(([,a], [,b]) => b - a);
    
    if (sortedTypes.length > 0) {
      trends.push(`Most active in ${sortedTypes[0][0]} content`);
      if (sortedTypes.length > 1) {
        trends.push(`Also creating ${sortedTypes[1][0]} content`);
      }
    }

    // Identify platform strengths
    const sortedPlatforms = Object.entries(platformCounts)
      .sort(([,a], [,b]) => b - a);
    
    if (sortedPlatforms.length > 0) {
      strengths.push(`Strong presence on ${sortedPlatforms[0][0]}`);
      if (sortedPlatforms.length > 1) {
        strengths.push(`Growing on ${sortedPlatforms[1][0]}`);
      }
    }

    // Identify content gaps
    const allPlatforms = ['youtube', 'instagram', 'spotify', 'pinterest', 'facebook', 'tiktok', 'twitter'];
    const missingPlatforms = allPlatforms.filter(platform => 
      !Object.keys(platformCounts).some(userPlatform => 
        userPlatform.toLowerCase().includes(platform)
      )
    );
    
    if (missingPlatforms.length > 0) {
      gaps.push(`Untapped potential on ${missingPlatforms.slice(0, 2).join(' and ')}`);
    }

    // Audience insights based on engagement
    if (engagementData.length > 0) {
      const avgEngagement = engagementData.reduce((sum, val) => sum + val, 0) / engagementData.length;
      if (avgEngagement > 1500) {
        insights.push('High audience engagement - content resonates well');
      } else if (avgEngagement > 800) {
        insights.push('Moderate engagement - room for optimization');
      } else {
        insights.push('Growing audience - focus on quality over quantity');
      }
    }

    return { userTrends: trends, contentGaps: gaps, platformStrengths: strengths, audienceInsights: insights };
  };

  // Generate diverse content suggestions using OpenAI
  const generateDiverseSuggestions = async (analysis: ContentAnalysis): Promise<EnhancedSuggestion[]> => {
    try {
      // Create a comprehensive prompt for diverse suggestions
      const prompt = `Based on this content creator's analysis, generate 3 diverse content suggestions:

User Trends: ${analysis.userTrends.join(', ')}
Content Gaps: ${analysis.contentGaps.join(', ')}
Platform Strengths: ${analysis.platformStrengths.join(', ')}
Audience Insights: ${analysis.audienceInsights.join(', ')}

Generate 3 suggestions that:
1. Come from DIFFERENT platforms (YouTube, Instagram, Spotify, Pinterest, Facebook, TikTok)
2. Are relevant to their current content patterns
3. Address identified content gaps
4. Leverage their platform strengths
5. Match their audience engagement level

Format each suggestion as:
**Title**: [Creative, engaging title]
**Platform**: [Specific platform name]
**Content Type**: [Video/Image/Audio/Text]
**Explanation**: [Why this suggestion is relevant and how it fits their strategy]
**Estimated Engagement**: [Number based on their current performance]
**Difficulty**: [Easy/Medium/Hard]
**Time to Create**: [Estimated time]
**Tags**: [3-5 relevant hashtags or keywords]
**Image**: [Relevant stock image URL]
**URL**: [Example or inspiration URL]`;

      const suggestionsText = await getCreationInspirationsOpenAI(
        userContent.filter((item: any) => !item.id.startsWith('default-')),
        true // withLinks
      );

      if (suggestionsText === 'timeout') {
        throw new Error('AI analysis is taking longer than expected');
      }

      // Parse the enhanced suggestions
      const parsedSuggestions = parseEnhancedSuggestions(suggestionsText);
      
      // Ensure diversity by platform
      const diverseSuggestions = ensurePlatformDiversity(parsedSuggestions);
      
      return diverseSuggestions.slice(0, limit);
    } catch (error) {
      console.error('Error generating diverse suggestions:', error);
      // Return fallback suggestions based on analysis
      return generateFallbackSuggestions(analysis);
    }
  };

  // Generate fallback suggestions when AI fails
  const generateFallbackSuggestions = (analysis: ContentAnalysis): EnhancedSuggestion[] => {
    const fallbackSuggestions: EnhancedSuggestion[] = [];
    
    // YouTube suggestion
    if (analysis.contentGaps.some(gap => gap.toLowerCase().includes('youtube'))) {
      fallbackSuggestions.push({
        title: "Create a 'Day in the Life' Vlog",
        explanation: "Share your daily routine and behind-the-scenes content to connect with your audience on a personal level.",
        url: "https://www.youtube.com",
        image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        platform: "YouTube",
        contentType: "Video",
        estimatedEngagement: 1200,
        difficulty: "Medium",
        timeToCreate: "2-3 hours",
        tags: ["vlog", "lifestyle", "behind-the-scenes", "daily", "personal"]
      });
    }

    // Instagram suggestion
    if (analysis.contentGaps.some(gap => gap.toLowerCase().includes('instagram'))) {
      fallbackSuggestions.push({
        title: "Share Your Creative Process",
        explanation: "Document your creative journey with before/after shots and process videos to inspire your followers.",
        url: "https://www.instagram.com",
        image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        platform: "Instagram",
        contentType: "Image/Video",
        estimatedEngagement: 800,
        difficulty: "Easy",
        timeToCreate: "30 minutes",
        tags: ["creative", "process", "inspiration", "art", "design"]
      });
    }

    // Spotify suggestion
    if (analysis.contentGaps.some(gap => gap.toLowerCase().includes('spotify'))) {
      fallbackSuggestions.push({
        title: "Start a Podcast Series",
        explanation: "Share your expertise and insights through audio content that your audience can consume on-the-go.",
        url: "https://www.spotify.com",
        image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        platform: "Spotify",
        contentType: "Audio",
        estimatedEngagement: 600,
        difficulty: "Hard",
        timeToCreate: "1 week",
        tags: ["podcast", "audio", "expertise", "insights", "series"]
      });
    }

    // Ensure we have at least 3 suggestions
    while (fallbackSuggestions.length < 3) {
      const platforms = ['Pinterest', 'Facebook', 'TikTok'];
      const platform = platforms[fallbackSuggestions.length];
      
      fallbackSuggestions.push({
        title: `Create Engaging ${platform} Content`,
        explanation: `Expand your reach by creating platform-specific content that resonates with ${platform} users.`,
        url: `https://www.${platform.toLowerCase()}.com`,
        image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        platform: platform,
        contentType: "Mixed",
        estimatedEngagement: 500,
        difficulty: "Medium",
        timeToCreate: "1-2 hours",
        tags: ["expansion", "platform", "engagement", "growth", "diversity"]
      });
    }

    return fallbackSuggestions.slice(0, limit);
  };

  // Parse enhanced suggestions with more detailed information
  const parseEnhancedSuggestions = (text: string): EnhancedSuggestion[] => {
    const suggestions: EnhancedSuggestion[] = [];
    const lines = text.split('\n');
    
    let currentSuggestion: Partial<EnhancedSuggestion> = {};
    
    for (const line of lines) {
      if (line.startsWith('**Title**:')) {
        if (Object.keys(currentSuggestion).length > 0) {
          suggestions.push(currentSuggestion as EnhancedSuggestion);
        }
        currentSuggestion = {
          title: line.replace('**Title**:', '').trim(),
          estimatedEngagement: 1000,
          difficulty: 'Medium' as const,
          timeToCreate: '2-3 hours',
          tags: [],
          contentType: 'Video',
          platform: 'YouTube'
        };
      } else if (line.startsWith('**Platform**:')) {
        currentSuggestion.platform = line.replace('**Platform**:', '').trim();
      } else if (line.startsWith('**Content Type**:')) {
        currentSuggestion.contentType = line.replace('**Content Type**:', '').trim();
      } else if (line.startsWith('**Explanation**:')) {
        currentSuggestion.explanation = line.replace('**Explanation**:', '').trim();
      } else if (line.startsWith('**Estimated Engagement**:')) {
        const engagement = parseInt(line.replace('**Estimated Engagement**:', '').trim());
        if (!isNaN(engagement)) {
          currentSuggestion.estimatedEngagement = engagement;
        }
      } else if (line.startsWith('**Difficulty**:')) {
        const difficulty = line.replace('**Difficulty**:', '').trim();
        if (['Easy', 'Medium', 'Hard'].includes(difficulty)) {
          currentSuggestion.difficulty = difficulty as 'Easy' | 'Medium' | 'Hard';
        }
      } else if (line.startsWith('**Time to Create**:')) {
        currentSuggestion.timeToCreate = line.replace('**Time to Create**:', '').trim();
      } else if (line.startsWith('**Tags**:')) {
        const tags = line.replace('**Tags**:', '').trim();
        currentSuggestion.tags = tags.split(',').map(tag => tag.trim());
      } else if (line.startsWith('**Image**:')) {
        currentSuggestion.image = line.replace('**Image**:', '').trim();
      } else if (line.startsWith('**URL**:')) {
        currentSuggestion.url = line.replace('**URL**:', '').trim();
      }
    }
    
    // Add the last suggestion
    if (Object.keys(currentSuggestion).length > 0) {
      suggestions.push(currentSuggestion as EnhancedSuggestion);
    }
    
    return suggestions;
  };

  // Ensure suggestions come from different platforms
  const ensurePlatformDiversity = (suggestions: EnhancedSuggestion[]): EnhancedSuggestion[] => {
    const platformOrder = ['YouTube', 'Instagram', 'Spotify', 'Pinterest', 'Facebook', 'TikTok'];
    const diverseSuggestions: EnhancedSuggestion[] = [];
    const usedPlatforms = new Set<string>();
    
    // First, try to get one suggestion from each major platform
    for (const platform of platformOrder) {
      const suggestion = suggestions.find(s => 
        s.platform.toLowerCase().includes(platform.toLowerCase()) && 
        !usedPlatforms.has(platform)
      );
      if (suggestion) {
        diverseSuggestions.push(suggestion);
        usedPlatforms.add(platform);
        if (diverseSuggestions.length >= limit) break;
      }
    }
    
    // Fill remaining slots with any remaining suggestions
    for (const suggestion of suggestions) {
      if (diverseSuggestions.length >= limit) break;
      if (!diverseSuggestions.some(s => s.title === suggestion.title)) {
        diverseSuggestions.push(suggestion);
      }
    }
    
    return diverseSuggestions;
  };

  // Fetch AI suggestions with content analysis
  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Check if user has content to analyze
      if (!userContent || userContent.length === 0) {
        setError('No content found in your Content Hub. Upload some content first to get personalized suggestions.');
        setAiSuggestions(null);
        return;
      }

      // First, analyze user content
      const analysis = analyzeUserContent();
      setContentAnalysis(analysis);
      
      console.log('Content Analysis:', analysis);
      
      // Generate diverse suggestions based on analysis
      const suggestions = await generateDiverseSuggestions(analysis);
      setAiSuggestions(suggestions);
      
      // Pass suggestions to parent component
      if (onSuggestionsGenerated) {
        onSuggestionsGenerated(suggestions.map(s => ({
          title: s.title,
          explanation: s.explanation,
          url: s.url,
          image: s.image
        })));
      }
    } catch (err) {
      setError('Failed to generate AI suggestions. Showing trending content instead.');
      setAiSuggestions(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch suggestions when component mounts
  useEffect(() => {
    fetchSuggestions();
  }, [refreshKey]);

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Toggle analysis mode
  const toggleAnalysisMode = () => {
    setAnalysisMode(prev => prev === 'basic' ? 'advanced' : 'basic');
  };

  // Loading state
  if (isLoading && !aiSuggestions) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Creation Inspirations</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAnalysisMode}
              className="px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              {analysisMode === 'basic' ? 'Advanced' : 'Basic'}
            </button>
            {showRefreshButton && (
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Analyzing...</span>
              </button>
            )}
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your content and generating personalized suggestions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !aiSuggestions) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Creation Inspirations</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAnalysisMode}
              className="px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              {analysisMode === 'basic' ? 'Advanced' : 'Basic'}
            </button>
            {showRefreshButton && (
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show AI suggestions if available
  if (aiSuggestions && aiSuggestions.length > 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-purple-500" />
            AI-Powered Creation Inspirations
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAnalysisMode}
              className="px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              {analysisMode === 'basic' ? 'Advanced' : 'Basic'}
            </button>
            {showRefreshButton && (
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Analysis Summary */}
        {analysisMode === 'advanced' && contentAnalysis && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Content Analysis Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-purple-700 mb-2">📈 Your Trends</h4>
                <ul className="space-y-1 text-purple-600">
                  {contentAnalysis.userTrends.map((trend, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      {trend}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-2">🎯 Growth Opportunities</h4>
                <ul className="space-y-1 text-blue-600">
                  {contentAnalysis.contentGaps.map((gap, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-700 mb-2">💪 Platform Strengths</h4>
                <ul className="space-y-1 text-green-600">
                  {contentAnalysis.platformStrengths.map((strength, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-orange-700 mb-2">👥 Audience Insights</h4>
                <ul className="space-y-1 text-orange-600">
                  {contentAnalysis.audienceInsights.map((insight, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Success Message */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">
                  ✨ AI analysis complete! Generated {aiSuggestions?.length || 0} personalized content suggestions.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* High-Performing Posts Section */}
        <div className="mb-6">
          <HighPerformingPosts 
            showRefreshButton={true}
            onRefresh={handleRefresh}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiSuggestions.map((suggestion, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 hover:shadow-lg transition-all duration-300 border border-gray-200">
               {/* Platform Badge */}
               <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center space-x-2">
                   {suggestion.platform.toLowerCase().includes('youtube') && <Youtube className="w-5 h-5 text-red-500" />}
                   {suggestion.platform.toLowerCase().includes('instagram') && <Instagram className="w-5 h-5 text-pink-500" />}
                   {suggestion.platform.toLowerCase().includes('spotify') && <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-full"></div></div>}
                   {suggestion.platform.toLowerCase().includes('pinterest') && <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</div>}
                   {suggestion.platform.toLowerCase().includes('facebook') && <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">f</div>}
                   {suggestion.platform.toLowerCase().includes('tiktok') && <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">♪</div>}
                   {suggestion.platform.toLowerCase().includes('twitter') && <Twitter className="w-5 h-5 text-blue-400" />}
                   <span className="text-sm font-medium text-gray-700">{suggestion.platform}</span>
                 </div>
                 <span className={`px-2 py-1 text-xs rounded-full ${
                   suggestion.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                   suggestion.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                   'bg-red-100 text-red-700'
                 }`}>
                   {suggestion.difficulty}
                 </span>
               </div>

              {/* Content Image */}
              <div className="aspect-video mb-3 rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={suggestion.image}
                  alt={suggestion.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
                  }}
                />
              </div>

              {/* Content Details */}
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {suggestion.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {suggestion.explanation}
              </p>

              {/* Metrics */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>⏱️ {suggestion.timeToCreate}</span>
                <span>📊 ~{suggestion.estimatedEngagement.toLocaleString()} engagement</span>
              </div>

              {/* Tags */}
              {suggestion.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {suggestion.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Button */}
              {suggestion.url && (
                <a
                  href={suggestion.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <span>View Inspiration</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback to trending content
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Creation Inspirations</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAnalysisMode}
            className="px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            {analysisMode === 'basic' ? 'Advanced' : 'Basic'}
          </button>
          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* High-Performing Posts Section */}
      <div className="mb-6">
        <HighPerformingPosts 
          showRefreshButton={true}
          onRefresh={handleRefresh}
        />
      </div>
      
      {isPostsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trending content...</p>
        </div>
      ) : postsError ? (
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
          </div>
          <p className="text-gray-600 mb-4">Failed to load trending content</p>
          <button
            onClick={refreshPosts}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.slice(0, limit).map((post, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-3">
                {post.platform === 'instagram' && <Instagram className="w-5 h-5 text-pink-500" />}
                {post.platform === 'twitter' && <Twitter className="w-5 h-5 text-blue-400" />}
                {post.platform === 'youtube' && <Youtube className="w-5 h-5 text-red-500" />}
                <span className="text-sm text-gray-500 capitalize">{post.platform}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {post.title || 'Untitled Post'}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {post.description || 'No description available'}
              </p>
              {post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <span>View Post</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
          </div>
          <p className="text-gray-600">No trending content available</p>
        </div>
      )}
    </div>
  );
};

export default CreationInspirationsLazy;
