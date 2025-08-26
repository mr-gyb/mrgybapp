import { v4 as uuidv4 } from 'uuid';
import { ContentType, AnalysisResult, ContentItem } from '../../types/content';
import OpenAI from 'openai';

const mockDerivatives = [
  {
    id: '1',
    derivative_type: 'headline' as const,
    content: 'Innovative Solutions for Modern Business Challenges',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    derivative_type: 'blog' as const,
    content: 'In today\'s rapidly evolving business landscape, organizations face unprecedented challenges...',
    created_at: new Date().toISOString()
  }
];

export const analyzeContent = async (
  userId: string,
  content: string | File,
  contentType: ContentType
): Promise<string> => {
  return uuidv4();
};

export const getContentAnalysis = async (analysisId: string): Promise<AnalysisResult> => {
  return {
    id: analysisId,
    content_type: 'text',
    original_content: '',
    storage_path: null,
    created_at: new Date().toISOString(),
    content_derivatives: mockDerivatives
  };
};

const handleContentUpload = async (userId: string, content: string | File) => {
  if (typeof content === 'string') {
    return { storagePath: null, contentText: content };
  }

  return { 
    storagePath: `${userId}/${uuidv4()}.${content.name.split('.').pop()}`,
    contentText: content.type === 'text/plain' ? await content.text() : ''
  };
};

const createAnalysisRecord = async (
  userId: string, 
  content: string, 
  contentType: ContentType,
  storagePath: string | null
) => {
  return {
    id: uuidv4(),
    user_id: userId,
    original_content: content,
    content_type: contentType,
    storage_path: storagePath,
    created_at: new Date().toISOString()
  };
};

const generateDerivatives = async (
  analysisId: string,
  content: string,
  contentType: ContentType
) => {
  // Mock derivative generation
  return mockDerivatives;
};

const saveDerivative = async (analysisId: string, type: string, content: string) => {
  // Mock saving derivative
  return {
    id: uuidv4(),
    analysis_id: analysisId,
    derivative_type: type,
    content: content,
    created_at: new Date().toISOString()
  };
};

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Enhanced content analysis that analyzes user-uploaded content and generates relevant suggestions
 * @param userContent Array of ContentItem from user's uploaded content
 * @returns Promise<string> Detailed analysis and suggestions
 */
export const analyzeUserContentAndSuggest = async (userContent: ContentItem[]): Promise<string> => {
  try {
    // Filter out default content and get real user content
    const realUserContent = userContent.filter(item => !item.id.startsWith('default-'));
    
    if (realUserContent.length === 0) {
      return 'No user-uploaded content found. Please upload some content to get personalized suggestions.';
    }

    // Analyze content types and patterns
    const contentAnalysis = analyzeContentTypes(realUserContent);
    
    // Extract themes and topics from content titles and descriptions
    const contentThemes = extractContentThemes(realUserContent);
    
    // Generate detailed prompt for OpenAI
    const prompt = createAnalysisPrompt(contentAnalysis, contentThemes, realUserContent);
    
      // Call OpenAI for analysis and suggestions
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are an expert content strategist and social media analyst. Your task is to analyze a user's uploaded content and provide 3 highly relevant content suggestions based on their actual content patterns, themes, and preferences.

IMPORTANT REQUIREMENTS:
1. Analyze the user's actual uploaded content (titles, descriptions, types, platforms)
2. Identify patterns, themes, and content preferences
3. Generate 3 specific, actionable content suggestions
4. Each suggestion must include:
   - A bolded title (**Title**)
   - A detailed explanation of why this suggestion is relevant
   - A real, relevant link to an example or inspiration
   - A relevant image URL

IMPORTANT: Use ONLY these working example links:
- YouTube: https://www.youtube.com/watch?v=dQw4w9WgXcQ
- Instagram: https://www.instagram.com/explore/tags/contentcreation/
- LinkedIn: https://www.linkedin.com/pulse/topics/content-creation/
- TikTok: https://www.tiktok.com/tag/contentcreation
- Pinterest: https://www.pinterest.com/search/pins/?q=content%20creation

And use ONLY these working image URLs:
- https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop
- https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop
- https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop
- https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=300&fit=crop
- https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop

Format each suggestion exactly as:
1. **Title**: Detailed explanation of relevance to user's content (link: https://www.youtube.com/watch?v=dQw4w9WgXcQ) (image: https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop)
2. **Title**: Detailed explanation of relevance to user's content (link: https://www.instagram.com/explore/tags/contentcreation/) (image: https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop)
3. **Title**: Detailed explanation of relevance to user's content (link: https://www.linkedin.com/pulse/topics/content-creation/) (image: https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop)

Focus on suggestions that build upon the user's existing content strengths and interests.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
      max_tokens: 800,
    temperature: 0.7
  });

    return response.choices[0]?.message?.content || 'Unable to generate suggestions at this time.';
  } catch (error) {
    console.error('Error analyzing user content:', error);
    return 'Error analyzing content. Please try again.';
  }
};

/**
 * Analyze content types and distribution
 */
const analyzeContentTypes = (userContent: ContentItem[]) => {
  const typeCounts: Record<string, number> = {};
  const platformCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};

  userContent.forEach(item => {
    // Count by content type
    typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
    
    // Count by platforms
    if (item.platforms) {
      item.platforms.forEach(platform => {
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
      });
    }
    
    // Count by status
    statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
  });

  return {
    typeCounts,
    platformCounts,
    statusCounts,
    totalContent: userContent.length,
    dominantType: Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '',
    dominantPlatform: Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
  };
};

/**
 * Extract themes and topics from content
 */
const extractContentThemes = (userContent: ContentItem[]) => {
  const themes: string[] = [];
  const keywords: string[] = [];

  userContent.forEach(item => {
    // Extract themes from titles
    if (item.title) {
      const titleWords = item.title.toLowerCase().split(' ');
      keywords.push(...titleWords.filter(word => word.length > 3));
    }
    
    // Extract themes from descriptions
    if (item.description) {
      const descWords = item.description.toLowerCase().split(' ');
      keywords.push(...descWords.filter(word => word.length > 3));
    }
  });

  // Count keyword frequency
  const keywordCounts: Record<string, number> = {};
  keywords.forEach(keyword => {
    keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
  });

  // Get top keywords
  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword]) => keyword);

  return {
    keywords: topKeywords,
    themes: identifyThemes(topKeywords)
  };
};

/**
 * Identify themes from keywords
 */
const identifyThemes = (keywords: string[]): string[] => {
  const themes: string[] = [];
  
  // Business/Professional themes
  if (keywords.some(k => ['business', 'marketing', 'strategy', 'growth', 'entrepreneur'].includes(k))) {
    themes.push('Business & Entrepreneurship');
  }
  
  // Creative themes
  if (keywords.some(k => ['creative', 'design', 'art', 'visual', 'brand'].includes(k))) {
    themes.push('Creative & Design');
  }
  
  // Technology themes
  if (keywords.some(k => ['tech', 'technology', 'digital', 'innovation', 'startup'].includes(k))) {
    themes.push('Technology & Innovation');
  }
  
  // Lifestyle themes
  if (keywords.some(k => ['lifestyle', 'health', 'fitness', 'wellness', 'personal'].includes(k))) {
    themes.push('Lifestyle & Wellness');
  }
  
  // Education themes
  if (keywords.some(k => ['education', 'learning', 'tutorial', 'guide', 'tips'].includes(k))) {
    themes.push('Education & Learning');
  }

  return themes.length > 0 ? themes : ['General Content'];
};

/**
 * Create detailed analysis prompt
 */
const createAnalysisPrompt = (contentAnalysis: any, contentThemes: any, userContent: ContentItem[]) => {
  const recentContent = userContent.slice(-5).map(item => 
    `- ${item.title || 'Untitled'}: ${item.description || 'No description'} (Type: ${item.type}, Platforms: ${item.platforms?.join(', ') || 'None'})`
  ).join('\n');

  return `USER CONTENT ANALYSIS:

Content Distribution:
${Object.entries(contentAnalysis.typeCounts).map(([type, count]) => `- ${type}: ${count} items`).join('\n')}

Platform Usage:
${Object.entries(contentAnalysis.platformCounts).map(([platform, count]) => `- ${platform}: ${count} items`).join('\n')}

Content Themes Identified:
${contentThemes.themes.join(', ')}

Top Keywords:
${contentThemes.keywords.join(', ')}

Recent Content:
${recentContent}

Dominant Content Type: ${contentAnalysis.dominantType}
Dominant Platform: ${contentAnalysis.dominantPlatform}

Based on this analysis, provide 3 highly relevant content suggestions that:
1. Build upon the user's existing content strengths
2. Align with their identified themes and interests
3. Leverage their preferred platforms
4. Offer specific, actionable content ideas

Each suggestion should be tailored to their actual content patterns and preferences.`;
};

/**
 * Analyze user content and generate top 3 tailored content creation suggestions using OpenAI
 * @param userContent Array of ContentItem
 * @param withLinks boolean - if true, request suggestions with relevant links
 * @returns Promise<string> Suggestions as raw text (for parsing)
 */
export const getCreationInspirationsOpenAI = async (userContent: ContentItem[], withLinks?: boolean): Promise<string> => {
  try {
    if (!userContent || userContent.length === 0) {
      return 'No user content available for analysis.';
    }

    // Analyze user content patterns
    const contentAnalysis = analyzeContentDistribution(userContent);
    const contentThemes = analyzeContentThemes(userContent);
    
    // Create enhanced analysis prompt
    const prompt = createEnhancedAnalysisPrompt(contentAnalysis, contentThemes, userContent);
    
    console.log('Sending enhanced analysis prompt to OpenAI:', prompt);

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert content strategist and social media consultant. 
          Analyze the user's content patterns and provide 3 diverse, actionable content suggestions.
          Each suggestion should come from a different platform and be tailored to their specific content strategy.
          Focus on practical, implementable ideas that leverage their strengths and address growth opportunities.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
      timeout: 30000
    });

    const suggestions = response.choices[0]?.message?.content || 'No suggestions generated.';
    console.log('OpenAI response received:', suggestions);
    
    return suggestions;
  } catch (error) {
    console.error('Error in getCreationInspirationsOpenAI:', error);
    
    if (error instanceof Error && error.message.includes('timeout')) {
      return 'timeout';
    }
    
    throw new Error(`Failed to generate content suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Create enhanced analysis prompt for diverse content suggestions
 */
const createEnhancedAnalysisPrompt = (contentAnalysis: any, contentThemes: any, userContent: ContentItem[]) => {
  const recentContent = userContent.slice(-5).map(item => 
    `- ${item.title || 'Untitled'}: ${item.description || 'No description'} (Type: ${item.type}, Platforms: ${item.platforms?.join(', ') || 'None'})`
  ).join('\n');

  // Analyze platform diversity
  const platformCounts = contentAnalysis.platformCounts || {};
  const usedPlatforms = Object.keys(platformCounts);
  const allPlatforms = ['youtube', 'instagram', 'spotify', 'pinterest', 'facebook', 'tiktok', 'twitter'];
  const missingPlatforms = allPlatforms.filter(platform => 
    !usedPlatforms.some(used => used.toLowerCase().includes(platform))
  );

  // Analyze content performance patterns
  const engagementData = userContent
    .filter(item => item.engagement)
    .map(item => item.engagement!);
  
  const avgEngagement = engagementData.length > 0 
    ? engagementData.reduce((sum, val) => sum + val, 0) / engagementData.length 
    : 0;

  return `CONTENT CREATOR ANALYSIS:

Content Distribution:
${Object.entries(contentAnalysis.typeCounts || {}).map(([type, count]) => `- ${type}: ${count} items`).join('\n')}

Platform Usage:
${Object.entries(platformCounts).map(([platform, count]) => `- ${platform}: ${count} items`).join('\n')}

Content Themes:
${contentThemes.themes.join(', ')}

Top Keywords:
${contentThemes.keywords.join(', ')}

Performance Insights:
- Average Engagement: ${avgEngagement.toFixed(0)}
- Content Types: ${Object.keys(contentAnalysis.typeCounts || {}).join(', ')}
- Platform Strengths: ${usedPlatforms.join(', ')}
- Growth Opportunities: ${missingPlatforms.slice(0, 3).join(', ')}

Recent Content:
${recentContent}

Based on this analysis, generate 3 diverse content suggestions that:

1. Come from DIFFERENT platforms (ensure platform diversity)
2. Build upon their existing content strengths
3. Address identified content gaps and opportunities
4. Match their current engagement level and audience
5. Provide specific, actionable content ideas

Format each suggestion exactly as follows:

**Title**: [Creative, engaging title]
**Platform**: [Specific platform name - YouTube, Instagram, Spotify, Pinterest, Facebook, TikTok]
**Content Type**: [Video/Image/Audio/Text]
**Explanation**: [Why this suggestion is relevant and how it fits their strategy]
**Estimated Engagement**: [Number based on their current performance]
**Difficulty**: [Easy/Medium/Hard]
**Time to Create**: [Estimated time - e.g., "30 minutes", "2-3 hours", "1 week"]
**Tags**: [3-5 relevant hashtags or keywords, comma-separated]
**Image**: [Relevant stock image URL from Unsplash]
**URL**: [Example or inspiration URL]

Ensure each suggestion is practical, relevant, and tailored to their specific content patterns.`;
};