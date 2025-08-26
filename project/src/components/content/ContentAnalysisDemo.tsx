import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Search, 
  Lightbulb, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
  Users,
  Hash,
  MessageSquare
} from 'lucide-react';
import { 
  analyzeContent, 
  getInspiration, 
  ContentAnalysis, 
  Candidate,
  analysisCircuitBreaker,
  handleAnalysisError
} from '../../services/contentAnalysis.service';
import { ContentItem } from '../../types/content';

interface ContentAnalysisDemoProps {
  userContent: ContentItem[];
  onRefresh?: () => void;
}

const ContentAnalysisDemo: React.FC<ContentAnalysisDemoProps> = ({ 
  userContent, 
  onRefresh 
}) => {
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [inspiration, setInspiration] = useState<Candidate[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingInspiration, setIsLoadingInspiration] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'basic' | 'advanced'>('basic');

  // Filter out default content
  const realContent = userContent.filter(item => !item.id.startsWith('default-'));

  // Run analysis when component mounts or content changes
  useEffect(() => {
    if (realContent.length > 0) {
      runAnalysis();
    }
  }, [realContent]);

  // Run content analysis
  const runAnalysis = async () => {
    if (realContent.length === 0) {
      setError('No content to analyze. Please upload some content first.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      console.log('🚀 Starting content analysis...');
      
      // Use circuit breaker for analysis
      const result = await analysisCircuitBreaker.execute(() => 
        analyzeContent(realContent)
      );
      
      setAnalysis(result);
      console.log('✅ Analysis completed successfully');
      
      // Automatically get inspiration after analysis
      if (analysisMode === 'advanced') {
        await getInspirationResults(result);
      }
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      const errorMessage = handleAnalysisError(error);
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get inspiration results
  const getInspirationResults = async (analysisData: ContentAnalysis) => {
    setIsLoadingInspiration(true);
    setError(null);

    try {
      console.log('🎯 Getting inspiration results...');
      const results = await getInspiration(analysisData, realContent, 5);
      setInspiration(results);
      console.log('✅ Inspiration results received');
    } catch (error) {
      console.error('❌ Inspiration failed:', error);
      setError('Failed to get inspiration. Please try again.');
    } finally {
      setIsLoadingInspiration(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    runAnalysis();
    onRefresh?.();
  };

  // Handle mode change
  const handleModeChange = (mode: 'basic' | 'advanced') => {
    setAnalysisMode(mode);
    if (mode === 'advanced' && analysis) {
      getInspirationResults(analysis);
    }
  };

  // Render platform insights
  const renderPlatformInsights = () => {
    if (!analysis) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Platform Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analysis.platforms.map(platform => {
            const platformData = analysis.per_platform[platform];
            if (!platformData.present) return null;

            return (
              <div key={platform} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800 capitalize">{platform}</h4>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">
                      {platformData.hashtags?.slice(0, 3).join(', ') || 'No hashtags'}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">
                      {platformData.content_types?.slice(0, 2).join(', ') || 'No content types'}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">
                      {platformData.recommended_time_window_days} days window
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render inspiration results
  const renderInspiration = () => {
    if (inspiration.length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2" />
          Content Inspiration
        </h3>
        
        <div className="space-y-3">
          {inspiration.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize mr-2">
                      {item.platform}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Unknown date'}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-800 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{item.snippet}</p>
                  
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
                  >
                    <Search className="w-4 h-4 mr-1" />
                    View Content
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Inspiration Disclaimer</p>
              <p>These are suggestions for inspiration only. Don't copy content directly - use them as directional signals for your own creative work.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render global summary
  const renderGlobalSummary = () => {
    if (!analysis) return null;

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Content Analysis Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analysis.global_summary.total_items}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analysis.platforms.length}</div>
            <div className="text-sm text-gray-600">Platforms</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analysis.global_summary.content_diversity_score.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Diversity Score</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {analysis.global_summary.overall_tone}
            </div>
            <div className="text-sm text-gray-600">Overall Tone</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-800 mb-2">Dominant Themes</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.global_summary.dominant_themes.map((theme, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Empty state
  if (realContent.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Content to Analyze</h3>
        <p className="text-gray-600 mb-4">
          Upload some content to get started with content analysis and inspiration.
        </p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Analysis</h2>
          <p className="text-gray-600">
            Analyze your content patterns and get platform-specific insights
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={analysisMode}
            onChange={(e) => handleModeChange(e.target.value as 'basic' | 'advanced')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="basic">Basic Analysis</option>
            <option value="advanced">Advanced + Inspiration</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={isAnalyzing}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">Analysis Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <RefreshCw className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Content</h3>
          <p className="text-gray-600">Please wait while we analyze your content patterns...</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !isAnalyzing && (
        <>
          {renderGlobalSummary()}
          {renderPlatformInsights()}
          
          {analysisMode === 'advanced' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Inspiration</h3>
                <button
                  onClick={() => getInspirationResults(analysis)}
                  disabled={isLoadingInspiration}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                >
                  {isLoadingInspiration ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Lightbulb className="w-4 h-4 mr-2" />
                  )}
                  {isLoadingInspiration ? 'Loading...' : 'Get Inspiration'}
                </button>
              </div>
              
              {isLoadingInspiration && (
                <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
                  <RefreshCw className="w-16 h-16 text-green-600 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Finding relevant inspiration...</p>
                </div>
              )}
              
              {renderInspiration()}
            </div>
          )}
        </>
      )}

      {/* Success Message */}
      {analysis && !isAnalyzing && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Analysis Complete</p>
              <p>Your content has been analyzed successfully. {analysisMode === 'advanced' && 'Use the inspiration section to discover new content ideas.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentAnalysisDemo;
