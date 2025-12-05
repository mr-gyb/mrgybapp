/**
 * Content Inspiration Agent
 * 
 * A local social media expert agent that generates content ideas based on:
 * - User's past uploads
 * - User's selected business industry/niche
 * 
 * This is a local agent (similar to dreamTeamAgent) that doesn't call external APIs.
 * It uses intelligent placeholder logic to generate contextual content ideas.
 * 
 * TODO: Replace with real AI/training data when available.
 */

export interface ContentIdea {
  title: string;
  shortDescription: string;
  recommendedPlatform: string;
  // Legacy fields for backward compatibility
  description?: string;
  platformSuggestions?: string[];
}

export interface ContentInspirationInput {
  pastUploads?: Array<{
    title: string;
    type: string;
    platforms?: string[];
    description?: string;
  }>;
  industry?: string;
}

/**
 * Generate three content ideas based on user's uploads and/or industry
 * 
 * Uses the backend agent API endpoint /api/agent/content-inspiration
 * Falls back to local placeholder logic if API fails
 */
export async function generateContentInspiration(
  input: ContentInspirationInput
): Promise<ContentIdea[]> {
  const { pastUploads = [], industry } = input;
  
  // Try backend agent API first
  try {
    const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.trim() || 'http://localhost:8080';
    const agentEndpoint = `${backendUrl.replace(/\/$/, '')}/api/agent/content-inspiration`;
    
    console.log('[content-inspiration-agent] Calling backend agent API:', agentEndpoint);
    
    const response = await fetch(agentEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userUploadsSummary: pastUploads.map(upload => ({
          title: upload.title || 'Untitled',
          type: upload.type || 'other',
          platforms: upload.platforms || [],
          description: upload.description || '',
        })),
        businessIndustry: industry || undefined,
      }),
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && Array.isArray(result.ideas) && result.ideas.length >= 3) {
        console.log('[content-inspiration-agent] Backend agent returned', result.ideas.length, 'ideas');
        // Normalize to our ContentIdea format
        return result.ideas.slice(0, 3).map(idea => ({
          title: idea.title,
          shortDescription: idea.shortDescription || idea.description || '',
          recommendedPlatform: idea.recommendedPlatform || idea.platform || 'Instagram',
          // Legacy compatibility
          description: idea.shortDescription || idea.description,
          platformSuggestions: idea.recommendedPlatform ? [idea.recommendedPlatform] : [],
        }));
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.warn('[content-inspiration-agent] Backend API error:', response.status, errorData);
      // Fall through to placeholder
    }
  } catch (error) {
    console.warn('[content-inspiration-agent] Backend API call failed, using placeholder:', error);
    // Fall through to placeholder
  }
  
  // Fallback to local placeholder logic
  console.log('[content-inspiration-agent] Using local placeholder logic');
  const ideas = generateIdeasWithPlaceholder(input);
  // Convert placeholder format to new format
  return ideas.map(idea => ({
    title: idea.title,
    shortDescription: idea.description || idea.shortDescription || '',
    recommendedPlatform: idea.platformSuggestions?.[0] || 'Instagram',
    // Legacy compatibility
    description: idea.description,
    platformSuggestions: idea.platformSuggestions,
  }));
}

/**
 * Generate ideas using AI backend (DEPRECATED - not used anymore)
 * 
 * This function is kept for reference but is no longer called.
 * We use local placeholder logic instead to avoid API quota issues.
 */
async function generateIdeasWithAI_DEPRECATED(
  input: ContentInspirationInput
): Promise<ContentIdea[]> {
  const { pastUploads = [], industry } = input;
  
  // Build prompt for AI
  const prompt = buildAIPrompt(pastUploads, industry);
  
  // Get backend URL
  const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.trim() || 'http://localhost:8080';
  const chatEndpoint = `${backendUrl.replace(/\/$/, '')}/api/chat`;
  
  try {
    const response = await fetch(chatEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a social media content expert. Generate exactly 3 creative, actionable content ideas. Return them as a JSON array with this exact structure: [{"title": "Idea Title", "description": "Detailed description (2-3 sentences)", "platforms": ["Platform1", "Platform2"]}]. Only return the JSON array, no other text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: import.meta.env.VITE_MODEL_NAME || 'o3-mini',
        stream: true, // Backend streams by default
        temperature: 0.7,
        max_tokens: 1000
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // If it's a quota/rate limit error, throw a specific error that will be caught silently
      if (errorData.errorType === 'quota' || errorData.errorType === 'rate_limit' || response.status === 429) {
        throw new Error('AI quota/rate limit - using placeholder');
      }
      throw new Error(`AI request failed: ${response.status}`);
    }
    
    // Handle streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    
    if (!reader) {
      throw new Error('No response body');
    }
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const data = line.replace(/^data:\s*/, '').trim();
        if (!data || data === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(data);
          const delta = parsed?.choices?.[0]?.delta?.content || '';
          if (delta) {
            fullContent += delta;
          }
        } catch (parseError) {
          // Ignore parse errors for individual chunks
        }
      }
    }
    
    if (!fullContent.trim()) {
      throw new Error('Empty AI response');
    }
    
    // Parse JSON response (extract JSON array from response)
    const jsonMatch = fullContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const ideas = JSON.parse(jsonMatch[0]);
        if (Array.isArray(ideas) && ideas.length >= 3) {
          // Normalize to our format
          return ideas.slice(0, 3).map((idea: any) => ({
            title: idea.title || 'Content Idea',
            description: idea.description || idea.desc || '',
            platformSuggestions: idea.platforms || idea.platformSuggestions || []
          }));
        }
      } catch (parseError) {
        console.warn('[content-inspiration] Failed to parse AI JSON', parseError);
      }
    }
    
    throw new Error('Invalid AI response format');
  } catch (error) {
    // If AI fails, throw to trigger fallback
    // Re-throw with a normalized message for quota/rate limit detection
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('429') || errorMessage.includes('too many requests')) {
        throw new Error('AI quota/rate limit - using placeholder');
      }
    }
    throw error;
  }
}

/**
 * Build AI prompt from user context
 */
function buildAIPrompt(
  pastUploads: ContentInspirationInput['pastUploads'],
  industry?: string
): string {
  let prompt = 'Generate 3 creative content ideas for social media.\n\n';
  
  if (industry) {
    prompt += `Industry/Niche: ${industry}\n`;
  }
  
  if (pastUploads && pastUploads.length > 0) {
    prompt += `\nBased on the user's past uploads:\n`;
    pastUploads.slice(0, 5).forEach((upload, i) => {
      prompt += `${i + 1}. ${upload.title} (${upload.type})`;
      if (upload.platforms && upload.platforms.length > 0) {
        prompt += ` - Platforms: ${upload.platforms.join(', ')}`;
      }
      prompt += '\n';
    });
    
    const contentTypes = pastUploads.map(u => u.type);
    const platforms = pastUploads.flatMap(u => u.platforms || []);
    const dominantType = getMostCommon(contentTypes)[0] || '';
    const topPlatforms = getMostCommon(platforms, 3);
    
    if (dominantType) {
      prompt += `\nMost common content type: ${dominantType}\n`;
    }
    if (topPlatforms.length > 0) {
      prompt += `Most used platforms: ${topPlatforms.join(', ')}\n`;
    }
  } else {
    prompt += '\nNo past uploads available. Generate general content ideas.\n';
  }
  
  prompt += '\nGenerate 3 unique, actionable content ideas that would work well for this user.';
  
  return prompt;
}

/**
 * Generate ideas using intelligent placeholder logic
 * Always returns exactly 3 ideas
 */
function generateIdeasWithPlaceholder(
  input: ContentInspirationInput
): ContentIdea[] {
  try {
    const { pastUploads = [], industry } = input;
    
    // Safely extract insights from past uploads
    const safeUploads = Array.isArray(pastUploads) ? pastUploads : [];
    const contentTypes = safeUploads
      .map(upload => upload?.type)
      .filter(Boolean);
    const platforms = safeUploads
      .flatMap(upload => (Array.isArray(upload?.platforms) ? upload.platforms : []))
      .filter(Boolean);
    
    const dominantType = getMostCommon(contentTypes)[0] || '';
    const dominantPlatforms = getMostCommon(platforms, 3);
    
    // Determine industry context
    const industryContext = (industry && typeof industry === 'string' && industry.trim()) 
      ? industry.trim() 
      : 'general business';
    
    // Generate three unique ideas - always return 3
    const ideas: ContentIdea[] = [];
    
    // Idea 1: Based on dominant content type
    try {
      ideas.push(generateIdea1(dominantType, dominantPlatforms, industryContext));
    } catch (err) {
      console.warn('[content-inspiration] Error generating idea 1, using fallback', err);
      ideas.push({
        title: 'Engaging Content Series',
        shortDescription: `Create a series of engaging content pieces tailored to your ${industryContext} audience. Focus on providing value and building a community around your expertise.`,
        recommendedPlatform: dominantPlatforms.length > 0 ? dominantPlatforms[0] : 'Instagram',
        description: `Create a series of engaging content pieces tailored to your ${industryContext} audience. Focus on providing value and building a community around your expertise.`,
        platformSuggestions: dominantPlatforms.length > 0 ? dominantPlatforms : ['Instagram', 'LinkedIn', 'TikTok']
      });
    }
    
    // Idea 2: Cross-platform expansion
    try {
      ideas.push(generateIdea2(dominantType, dominantPlatforms, industryContext));
    } catch (err) {
      console.warn('[content-inspiration] Error generating idea 2, using fallback', err);
      ideas.push({
        title: 'Multi-Platform Content Campaign',
        shortDescription: `Create a coordinated content campaign across multiple platforms. Adapt your ${industryContext} content for each platform's unique format and audience preferences.`,
        recommendedPlatform: dominantPlatforms.length > 0 ? dominantPlatforms[0] : 'TikTok',
        description: `Create a coordinated content campaign across multiple platforms. Adapt your ${industryContext} content for each platform's unique format and audience preferences.`,
        platformSuggestions: dominantPlatforms.length > 0 
          ? [...dominantPlatforms, 'TikTok', 'LinkedIn'].slice(0, 3)
          : ['Instagram', 'TikTok', 'LinkedIn']
      });
    }
    
    // Idea 3: Industry-specific trend
    try {
      ideas.push(generateIdea3(industryContext, dominantPlatforms));
    } catch (err) {
      console.warn('[content-inspiration] Error generating idea 3, using fallback', err);
      ideas.push({
        title: `${industryContext.charAt(0).toUpperCase() + industryContext.slice(1)} Trend Content`,
        shortDescription: `Create content around the latest trends and developments in ${industryContext}. Position yourself as a forward-thinking expert by sharing timely insights and predictions.`,
        recommendedPlatform: dominantPlatforms.length > 0 ? dominantPlatforms[0] : 'LinkedIn',
        description: `Create content around the latest trends and developments in ${industryContext}. Position yourself as a forward-thinking expert by sharing timely insights and predictions.`,
        platformSuggestions: dominantPlatforms.length > 0
          ? dominantPlatforms.slice(0, 3)
          : ['LinkedIn', 'Instagram', 'Twitter']
      });
    }
    
    // Ensure we always return exactly 3 ideas
    if (ideas.length < 3) {
      console.warn('[content-inspiration] Generated fewer than 3 ideas, adding fallbacks');
      while (ideas.length < 3) {
        ideas.push({
          title: `Content Idea ${ideas.length + 1}`,
          shortDescription: `Create engaging content for your ${industryContext} audience. Focus on providing value and building connections.`,
          recommendedPlatform: 'Instagram',
          description: `Create engaging content for your ${industryContext} audience. Focus on providing value and building connections.`,
          platformSuggestions: ['Instagram', 'LinkedIn', 'TikTok']
        });
      }
    }
    
    return ideas.slice(0, 3); // Always return exactly 3
  } catch (error) {
    console.error('[content-inspiration] Critical error in placeholder logic', error);
    // Ultimate fallback - return 3 generic ideas
    return [
      {
        title: 'Educational Content Series',
        shortDescription: 'Create a series of educational posts that teach your audience something valuable. Share tips, insights, and actionable advice.',
        recommendedPlatform: 'Instagram Reels',
        description: 'Create a series of educational posts that teach your audience something valuable. Share tips, insights, and actionable advice.',
        platformSuggestions: ['Instagram', 'LinkedIn', 'TikTok']
      },
      {
        title: 'Behind-the-Scenes Content',
        shortDescription: 'Share behind-the-scenes content to build authenticity and trust. Show your process, team, or day-to-day operations.',
        recommendedPlatform: 'TikTok',
        description: 'Share behind-the-scenes content to build authenticity and trust. Show your process, team, or day-to-day operations.',
        platformSuggestions: ['Instagram', 'TikTok', 'YouTube']
      },
      {
        title: 'Community Engagement Campaign',
        shortDescription: 'Launch a campaign that encourages audience participation. Ask questions, run polls, or create user-generated content challenges.',
        recommendedPlatform: 'LinkedIn post',
        description: 'Launch a campaign that encourages audience participation. Ask questions, run polls, or create user-generated content challenges.',
        platformSuggestions: ['Instagram', 'Twitter', 'LinkedIn']
      }
    ];
  }
}

/**
 * Helper: Get most common item(s) from array
 */
function getMostCommon<T>(items: T[], count: number = 1): T[] {
  if (items.length === 0) return [];
  
  const frequency: Record<string, number> = {};
  items.forEach(item => {
    const key = String(item);
    frequency[key] = (frequency[key] || 0) + 1;
  });
  
  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => key as T);
  
  return sorted.length > 0 ? sorted : [items[0] as T].filter(Boolean);
}

/**
 * Generate Idea 1: Based on dominant content type
 */
function generateIdea1(
  dominantType: string,
  platforms: string[],
  industry: string
): ContentIdea {
  const typeMap: Record<string, { title: string; description: string }> = {
    video: {
      title: 'Behind-the-Scenes Video Series',
      description: `Create a weekly behind-the-scenes video series showing your ${industry} process, team culture, or day-to-day operations. This builds authenticity and trust with your audience.`
    },
    photo: {
      title: 'Visual Storytelling Campaign',
      description: `Develop a visual storytelling campaign using high-quality images to showcase your ${industry} expertise, products, or services. Focus on creating an emotional connection with your audience.`
    },
    written: {
      title: 'Educational Blog Series',
      description: `Write a comprehensive blog series addressing common questions and challenges in ${industry}. Position yourself as a thought leader by sharing valuable insights and actionable tips.`
    },
    audio: {
      title: 'Podcast or Audio Content Series',
      description: `Launch a podcast or audio content series discussing ${industry} trends, interviewing experts, or sharing insights. Audio content is highly consumable and builds authority.`
    }
  };
  
  const idea = typeMap[dominantType] || {
    title: 'Engaging Content Series',
    description: `Create a series of engaging content pieces tailored to your ${industry} audience. Focus on providing value and building a community around your expertise.`
  };
  
  const recommendedPlatform = platforms.length > 0 ? platforms[0] : 'Instagram';
  
  return {
    title: idea.title,
    shortDescription: idea.description,
    recommendedPlatform,
    description: idea.description,
    platformSuggestions: platforms.length > 0 
      ? platforms.slice(0, 3) 
      : ['Instagram', 'LinkedIn', 'TikTok']
  };
}

/**
 * Generate Idea 2: Cross-platform expansion
 */
function generateIdea2(
  dominantType: string,
  platforms: string[],
  industry: string
): ContentIdea {
  const expansionIdeas: Record<string, { title: string; description: string }> = {
    video: {
      title: 'Short-Form Video Content',
      description: `Repurpose your video content into short-form clips (15-60 seconds) for platforms like TikTok, Instagram Reels, and YouTube Shorts. This maximizes reach and engagement.`
    },
    photo: {
      title: 'Carousel Post Series',
      description: `Transform your images into educational carousel posts on Instagram and LinkedIn. Break down complex ${industry} concepts into digestible, swipeable content.`
    },
    written: {
      title: 'Social Media Thread Series',
      description: `Convert your written content into Twitter/X threads or LinkedIn carousel posts. Break down key points into bite-sized, shareable segments that drive engagement.`
    },
    audio: {
      title: 'Video Podcast with Visuals',
      description: `Expand your audio content into a video podcast format. Add visuals, graphics, and captions to make it accessible across YouTube, LinkedIn, and other video platforms.`
    }
  };
  
  const idea = expansionIdeas[dominantType] || {
    title: 'Multi-Platform Content Campaign',
    description: `Create a coordinated content campaign across multiple platforms. Adapt your ${industry} content for each platform's unique format and audience preferences.`
  };
  
  const suggestedPlatforms = platforms.length > 0
    ? [...platforms, 'TikTok', 'LinkedIn'].slice(0, 3)
    : ['Instagram', 'TikTok', 'LinkedIn'];
  const recommendedPlatform = suggestedPlatforms[0] || 'TikTok';
  
  return {
    title: idea.title,
    shortDescription: idea.description,
    recommendedPlatform,
    description: idea.description,
    platformSuggestions: suggestedPlatforms
  };
}

/**
 * Generate Idea 3: Industry-specific trend
 */
function generateIdea3(
  industry: string,
  platforms: string[]
): ContentIdea {
  const industryTrends: Record<string, { title: string; description: string }> = {
    'real estate': {
      title: 'Market Update Video Series',
      description: 'Create weekly market update videos showcasing new listings, neighborhood highlights, and market trends. Use Instagram Reels and YouTube Shorts for maximum reach.'
    },
    'coaching': {
      title: 'Transformation Story Series',
      description: 'Share client success stories and transformation journeys through video testimonials, before/after posts, and case studies. Build trust and showcase your impact.'
    },
    'e-commerce': {
      title: 'Product Showcase Campaign',
      description: 'Develop a product showcase campaign using high-quality images, unboxing videos, and user-generated content. Leverage Instagram, TikTok, and Pinterest for visual appeal.'
    },
    'technology': {
      title: 'Tech Tutorial Series',
      description: 'Create educational tech tutorials and how-to guides. Use screen recordings, code snippets, and step-by-step visuals to help your audience learn and grow.'
    },
    'marketing': {
      title: 'Marketing Strategy Breakdowns',
      description: 'Break down successful marketing campaigns and strategies. Use case studies, analytics screenshots, and behind-the-scenes content to teach your audience.'
    }
  };
  
  const idea = industryTrends[industry.toLowerCase()] || {
    title: `${industry.charAt(0).toUpperCase() + industry.slice(1)} Trend Content`,
    description: `Create content around the latest trends and developments in ${industry}. Position yourself as a forward-thinking expert by sharing timely insights and predictions.`
  };
  
  const suggestedPlatforms = platforms.length > 0
    ? platforms.slice(0, 3)
    : ['LinkedIn', 'Instagram', 'Twitter'];
  const recommendedPlatform = suggestedPlatforms[0] || 'LinkedIn';
  
  return {
    title: idea.title,
    shortDescription: idea.description,
    recommendedPlatform,
    description: idea.description,
    platformSuggestions: suggestedPlatforms
  };
}

