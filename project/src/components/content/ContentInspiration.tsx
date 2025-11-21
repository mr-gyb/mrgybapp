import React, { useState, useEffect, useCallback } from 'react';
import { Lightbulb, RefreshCw, Sparkles, Instagram, Linkedin, Twitter, Youtube, Facebook, Music, X } from 'lucide-react';
import { generateContentInspiration, ContentIdea } from '../../agents/contentInspirationAgent';
import { ContentItem } from '../../types/content';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface ContentInspirationProps {
  userContent?: ContentItem[];
  onClose?: () => void;
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  Instagram: <Instagram size={16} className="text-pink-600" />,
  LinkedIn: <Linkedin size={16} className="text-blue-600" />,
  Twitter: <Twitter size={16} className="text-blue-400" />,
  TikTok: <Music size={16} className="text-black" />,
  YouTube: <Youtube size={16} className="text-red-600" />,
  Facebook: <Facebook size={16} className="text-blue-700" />,
};

const ContentInspiration: React.FC<ContentInspirationProps> = ({ 
  userContent = [],
  onClose 
}) => {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [industry, setIndustry] = useState<string>('');
  const [hasTriedInitialLoad, setHasTriedInitialLoad] = useState(false);
  const { user } = useAuth();

  // Load user industry from profile
  useEffect(() => {
    const loadUserIndustry = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIndustry(userData.industry || '');
        }
      } catch (err) {
        console.error('Error loading user industry:', err);
        // Don't set error state here - just log it
      }
    };
    
    loadUserIndustry();
  }, [user]);

  // Safe handler for generating ideas
  const handleGenerateIdeas = useCallback(async () => {
    console.log('[content-inspiration] Button clicked, generating ideas...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare past uploads data safely
      const safeUserContent = Array.isArray(userContent) ? userContent : [];
      const pastUploads = safeUserContent
        .filter(item => item && !item.id?.startsWith('default-'))
        .map(item => ({
          title: item.title || 'Untitled',
          type: item.type || 'other',
          platforms: Array.isArray(item.platforms) ? item.platforms : [],
          description: item.description || ''
        }));
      
      console.log('[content-inspiration] Calling agent with:', { pastUploads: pastUploads.length, industry });
      
      // Generate ideas - agent should always return 3 ideas (AI or placeholder)
      const generatedIdeas = await generateContentInspiration({
        pastUploads,
        industry: industry || undefined
      });
      
      console.log('[content-inspiration] Agent returned:', generatedIdeas?.length, 'ideas');
      
      // Validate response - agent should always return 3 ideas (AI or placeholder)
      if (Array.isArray(generatedIdeas) && generatedIdeas.length > 0) {
        console.log('[content-inspiration] Setting ideas:', generatedIdeas.length);
        // Take up to 3 ideas, or use what we got
        const ideasToSet = generatedIdeas.slice(0, 3);
        setIdeas(ideasToSet);
        setError(null); // Clear any previous errors
      } else {
        // This shouldn't happen if agent is working correctly, but handle it gracefully
        console.error('[content-inspiration] Invalid ideas array received:', generatedIdeas);
        setError('Unable to generate ideas right now. Please try again.');
        setIdeas([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      // Only show error to user for unexpected errors, not quota/rate limits
      const isQuotaOrRateLimit = 
        errorMessage.toLowerCase().includes('quota') || 
        errorMessage.toLowerCase().includes('rate limit') ||
        errorMessage.includes('429');
      
      if (!isQuotaOrRateLimit) {
        console.error('Content inspiration error:', err);
        setError('Unable to generate ideas right now. Please try again.');
        setIdeas([]);
      } else {
        // Silently use placeholder for quota/rate limit - this is expected behavior
        // The agent's catch block should return placeholder ideas, but if we're here,
        // the error occurred before the agent could return. This shouldn't happen,
        // but if it does, the agent's fallback will handle it on next call.
        // For now, don't show error to user - they can click button again
        console.debug('[content-inspiration] Quota/rate limit detected, placeholder will be used on retry');
        // Don't set error state - let user retry
        // The agent will return placeholder ideas on next call
      }
    } finally {
      setIsLoading(false);
    }
  }, [userContent, industry]);

  // Generate ideas on mount (only once, or when userContent/industry changes significantly)
  useEffect(() => {
    // Only auto-generate if we have content or industry, and haven't tried yet
    const hasContent = Array.isArray(userContent) && userContent.length > 0;
    const hasIndustry = industry && industry.trim().length > 0;
    
    if ((hasContent || hasIndustry) && !hasTriedInitialLoad) {
      setHasTriedInitialLoad(true);
      handleGenerateIdeas();
    }
  }, [userContent, industry, hasTriedInitialLoad, handleGenerateIdeas]);

  const handleRefresh = useCallback(() => {
    console.log('[content-inspiration] Refresh button clicked');
    handleGenerateIdeas();
  }, [handleGenerateIdeas]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Sparkles className="text-purple-600 mr-3" size={24} />
          <div>
            <h2 className="text-2xl font-bold text-navy-blue">Content Inspiration</h2>
            <p className="text-sm text-gray-600 mt-1">
              Get AI-powered content ideas based on your past uploads and industry
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Industry Selector (if no industry in profile) */}
      {!industry && (
        <div className="mb-4">
          <label htmlFor="industry-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select your industry/niche:
          </label>
          <select
            id="industry-select"
            name="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-blue"
          >
            <option value="">Select an industry...</option>
            <option value="real estate">Real Estate</option>
            <option value="coaching">Coaching</option>
            <option value="e-commerce">E-commerce</option>
            <option value="technology">Technology</option>
            <option value="marketing">Marketing</option>
            <option value="healthcare">Healthcare</option>
            <option value="education">Education</option>
            <option value="finance">Finance</option>
            <option value="food & beverage">Food & Beverage</option>
            <option value="fitness">Fitness</option>
            <option value="general business">General Business</option>
          </select>
        </div>
      )}

      {/* Generate/Refresh Button */}
      <div className="mb-6">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[content-inspiration] Button onClick fired');
            handleRefresh();
          }}
          disabled={isLoading}
          className="bg-navy-blue text-white px-6 py-3 rounded-full hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
          type="button"
        >
          {isLoading ? (
            <>
              <RefreshCw size={18} className="mr-2 animate-spin" />
              Generating ideas...
            </>
          ) : ideas.length > 0 ? (
            <>
              <RefreshCw size={18} className="mr-2" />
              Generate 3 New Ideas
            </>
          ) : (
            <>
              <Lightbulb size={18} className="mr-2" />
              Generate 3 Ideas
            </>
          )}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <RefreshCw size={32} className="animate-spin text-navy-blue mx-auto mb-4" />
          <p className="text-gray-600">Generating personalized content ideas...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Ideas Display */}
      {!isLoading && ideas.length > 0 && (
        <div className="space-y-4">
          {ideas.map((idea, index) => {
            // Safety check for idea structure
            if (!idea || typeof idea !== 'object') {
              return null;
            }
            
            const ideaTitle = idea.title || 'Content Idea';
            const ideaDescription = idea.shortDescription || idea.description || 'No description available.';
            const platforms = idea.platformSuggestions || idea.platforms || [];
            
            return (
              <div
                key={`idea-${index}`}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-purple-600 font-bold text-lg">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-navy-blue mb-2">
                      {ideaTitle}
                    </h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {ideaDescription}
                    </p>
                    
                    {/* Recommended Platform */}
                    {idea.recommendedPlatform && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">Recommended platform:</span>
                        <div className="inline-flex items-center gap-1 bg-navy-blue/10 px-3 py-1 rounded-full text-sm text-navy-blue font-medium">
                          {PLATFORM_ICONS[idea.recommendedPlatform] || null}
                          <span>{idea.recommendedPlatform}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Legacy Platform Suggestions (if no recommendedPlatform) */}
                    {!idea.recommendedPlatform && Array.isArray(platforms) && platforms.length > 0 && (
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-sm text-gray-600 font-medium">Suggested platforms:</span>
                        {platforms.map((platform: string, pIndex: number) => {
                          if (!platform || typeof platform !== 'string') return null;
                          return (
                            <div
                              key={`platform-${pIndex}`}
                              className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
                            >
                              {PLATFORM_ICONS[platform] || null}
                              <span>{platform}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && ideas.length === 0 && !error && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Lightbulb size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            {!industry && (!Array.isArray(userContent) || userContent.length === 0)
              ? 'Select an industry or upload content to get started'
              : 'Click "Generate 3 Ideas" to get personalized content inspiration'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentInspiration;

