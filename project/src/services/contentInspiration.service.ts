import { defaultWebSearch } from './webSearch.service';

export interface ContentInspirationSearchResult {
  title: string;
  snippet: string;
  url: string;
  publishedAt?: string;
  platform?: string;
}

export interface ContentInspirationSearchParams {
  platform: string;
  topic: string;
}

/**
 * Search for content inspiration based on platform and topic
 * @param platform - The selected platform (facebook, instagram, youtube, pinterest)
 * @param topic - The selected topic (Marketing, Business, Technology, Writing)
 * @returns Array of search results
 */
export async function searchContentInspiration(
  platform: string,
  topic: string
): Promise<ContentInspirationSearchResult[]> {
  console.log('🔍 Starting content inspiration search:', { platform, topic });

  try {
    // Build platform-specific site filter
    const platformSiteFilter = getPlatformSiteFilter(platform);
    
    // Build search query combining platform, topic, and content type keywords
    const query = buildSearchQuery(platformSiteFilter, topic, platform);
    
    console.log('📝 Built search query:', query);

    // Perform web search
    const searchResults = await defaultWebSearch.search(query, {
      days: 30, // Search within last 30 days
      language: 'en'
    });

    console.log(`✅ Search returned ${searchResults.length} results`);

    // Filter results to match the selected platform
    const filteredResults = searchResults
      .filter(result => {
        // Ensure platform matches
        if (result.platform) {
          return result.platform.toLowerCase() === platform.toLowerCase();
        }
        // If platform not detected, check URL
        return result.url.toLowerCase().includes(platform.toLowerCase());
      })
      .map(result => ({
        title: result.title,
        snippet: result.snippet,
        url: result.url,
        publishedAt: result.publishedAt,
        platform: result.platform || platform
      }));

    console.log(`✅ Filtered to ${filteredResults.length} platform-specific results`);

    // If no results found, return empty array (or you could return mock data for testing)
    if (filteredResults.length === 0) {
      console.warn('⚠️ No results found, returning empty array');
      return [];
    }

    return filteredResults;

  } catch (error) {
    console.error('❌ Content inspiration search failed:', error);
    throw new Error(
      `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get platform-specific site filter for search query
 */
function getPlatformSiteFilter(platform: string): string {
  const platformMap: Record<string, string> = {
    facebook: 'site:facebook.com',
    instagram: 'site:instagram.com',
    youtube: 'site:youtube.com',
    pinterest: 'site:pinterest.com',
    tiktok: 'site:tiktok.com',
    twitter: 'site:twitter.com',
    linkedin: 'site:linkedin.com',
    spotify: 'site:spotify.com'
  };

  return platformMap[platform.toLowerCase()] || '';
}

/**
 * Build search query from platform, topic, and content keywords
 */
function buildSearchQuery(
  platformFilter: string,
  topic: string,
  platform: string
): string {
  // Topic-specific keywords
  const topicKeywords: Record<string, string[]> = {
    Marketing: ['marketing', 'advertising', 'campaign', 'strategy', 'promotion'],
    Business: ['business', 'entrepreneurship', 'startup', 'strategy', 'growth'],
    Technology: ['technology', 'tech', 'innovation', 'software', 'digital'],
    Writing: ['writing', 'content', 'blog', 'article', 'copywriting']
  };

  // Platform-specific content type keywords
  const platformContentTypes: Record<string, string[]> = {
    facebook: ['post', 'video', 'reel', 'story'],
    instagram: ['post', 'reel', 'story', 'carousel', 'IGTV'],
    youtube: ['video', 'tutorial', 'channel', 'playlist'],
    pinterest: ['pin', 'board', 'idea', 'inspiration']
  };

  const topicTerms = topicKeywords[topic] || [topic.toLowerCase()];
  const contentTypes = platformContentTypes[platform.toLowerCase()] || ['content'];
  
  // Build query: platform filter + topic terms + content types
  const queryParts = [
    platformFilter,
    `"${topicTerms.join('" OR "')}"`,
    `"${contentTypes.join('" OR "')}"`
  ].filter(Boolean);

  return queryParts.join(' ');
}

