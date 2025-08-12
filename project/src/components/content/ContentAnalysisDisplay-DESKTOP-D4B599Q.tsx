import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw, TrendingUp, Target, Users, BarChart3 } from 'lucide-react';
import { analyzeUserContentAndSuggest } from '../../services/content/analysis.service';
import { ContentItem } from '../../types/content';

interface ContentAnalysisDisplayProps {
  userContent: ContentItem[];
  onRefresh?: () => void;
}

interface AnalysisSuggestion {
  title: string;
  explanation: string;
  url: string;
  image: string;
}

const ContentAnalysisDisplay: React.FC<ContentAnalysisDisplayProps> = ({ 
  userContent, 
  onRefresh 
}) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [suggestions, setSuggestions] = useState<AnalysisSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentStats, setContentStats] = useState<any>(null);

  // Parse suggestions from OpenAI response
  const parseSuggestions = (text: string): AnalysisSuggestion[] => {
    const suggestions: AnalysisSuggestion[] = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      // Match format: **Title**: Explanation (link: https://...) (image: https://...)
      const match = line.match(/\*\*(.*?)\*\*[:\-]?\s*(.*?)(?:\(link:\s*(https?:\/\/[^)]+)\))?(?:\s*\(image:\s*(https?:\/\/[^)]+)\))?$/i);
      if (match) {
        const [, title, explanation, url, image] = match;
        suggestions.push({
          title: title.trim(),
          explanation: explanation.trim(),
          url: url || '',
          image: image || ''
        });
      }
    });
    
    return suggestions;
  };

  // Calculate content statistics
  const calculateStats = (content: ContentItem[]) => {
    const realContent = content.filter(item => !item.id.startsWith('default-'));
    
    if (realContent.length === 0) return null;

    const typeCounts: Record<string, number> = {};
    const platformCounts: Record<string, number> = {};
    
    realContent.forEach(item => {
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
      if (item.platforms) {
        item.platforms.forEach(platform => {
          platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        });
      }
    });

    const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    const dominantPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    return {
      totalContent: realContent.length,
      typeCounts,
      platformCounts,
      dominantType,
      dominantPlatform
    };
  };

  // Fetch analysis and suggestions
  const fetchAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const analysisText = await analyzeUserContentAndSuggest(userContent);
      setAnalysis(analysisText);
      
      // Parse suggestions if available
      const parsedSuggestions = parseSuggestions(analysisText);
      setSuggestions(parsedSuggestions);
      
      // Calculate stats
      const stats = calculateStats(userContent);
      setContentStats(stats);
    } catch (err) {
      setError('Failed to analyze content. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [userContent]);

  const handleRefresh = () => {
    fetchAnalysis();
    onRefresh?.();
  };

  const realContentCount = userContent.filter(item => !item.id.startsWith('default-')).length;

  if (realContentCount === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-start">
          <Lightbulb size={24} className="text-blue-600 mt-1" />
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Content Analysis
            </h3>
            <p className="text-blue-700 mb-4">
              Upload some content to get personalized analysis and suggestions based on your content patterns.
            </p>
            <div className="text-sm text-blue-600">
              <p>• Upload videos, images, or documents</p>
              <p>• Get AI-powered content analysis</p>
              <p>• Receive personalized content suggestions</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Statistics */}
      {contentStats && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Content Analysis</h3>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <BarChart3 size={20} className="text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-blue-600">Total Content</p>
                  <p className="text-2xl font-bold text-blue-800">{contentStats.totalContent}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <Target size={20} className="text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-green-600">Dominant Type</p>
                  <p className="text-lg font-semibold text-green-800 capitalize">{contentStats.dominantType}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <Users size={20} className="text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-purple-600">Top Platform</p>
                  <p className="text-lg font-semibold text-purple-800 capitalize">{contentStats.dominantPlatform}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Type Distribution */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-700 mb-3">Content Type Distribution</h4>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {Object.entries(contentStats.typeCounts).map(([type, count]) => (
                 <div key={type} className="bg-gray-50 rounded-lg p-3">
                   <p className="text-sm text-gray-600 capitalize">{type}</p>
                   <p className="text-lg font-semibold text-gray-800">{count as number}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <TrendingUp size={24} className="text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Personalized Content Suggestions</h3>
          </div>

          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                    <span className="text-green-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{suggestion.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{suggestion.explanation}</p>
                    
                                         {suggestion.url && (
                       <div className="flex items-center space-x-4 text-xs">
                         {suggestion.image && (
                           <img 
                             src={suggestion.image} 
                             alt={suggestion.title}
                             className="w-16 h-16 object-cover rounded"
                             onError={(e) => {
                               e.currentTarget.style.display = 'none';
                             }}
                           />
                         )}
                         <a 
                           href={suggestion.url} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-blue-600 hover:text-blue-800 underline"
                           onClick={(e) => {
                             // Validate URL before opening
                             try {
                               new URL(suggestion.url);
                             } catch {
                               e.preventDefault();
                               alert('This is a demonstration link. In a real application, this would open a relevant example.');
                             }
                           }}
                         >
                           View Example →
                         </a>
                       </div>
                     )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center">
            <RefreshCw size={20} className="animate-spin mr-2 text-gray-600" />
            <span className="text-gray-600">Analyzing your content...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentAnalysisDisplay; 