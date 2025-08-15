import { Platform, InspirationQuery, Candidate } from './contentAnalysis.service';

// Web search interface contract
export interface WebSearch {
  search(query: string, opts: { days?: number; language?: string }): Promise<{ 
    title: string; 
    snippet: string; 
    url: string; 
    publishedAt?: string;
    platform?: Platform;
  }[]>;
}

// Mock web search implementation for testing
export class MockWebSearch implements WebSearch {
  async search(query: string, opts: { days?: number; language?: string }): Promise<{ 
    title: string; 
    snippet: string; 
    url: string; 
    publishedAt?: string;
    platform?: Platform;
  }[]> {
    console.log('🔍 Mock web search for query:', query, 'with options:', opts);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // Extract platform from query if possible
    let platform: Platform | undefined;
    if (query.includes('site:facebook.com')) platform = 'facebook';
    else if (query.includes('site:instagram.com')) platform = 'instagram';
    else if (query.includes('site:pinterest.com')) platform = 'pinterest';
    else if (query.includes('site:youtube.com')) platform = 'youtube';
    else if (query.includes('site:tiktok.com')) platform = 'tiktok';
    else if (query.includes('site:twitter.com')) platform = 'twitter';
    else if (query.includes('site:linkedin.com')) platform = 'linkedin';
    else if (query.includes('site:spotify.com')) platform = 'spotify';
    
    // Generate mock results
    const results = [];
    for (let i = 1; i <= 5; i++) {
      const baseUrl = platform ? `https://${platform}.com` : 'https://example.com';
      results.push({
        title: `Mock Search Result ${i} for "${query.split(' ').slice(0, 3).join(' ')}"`,
        snippet: `This is a mock search result that would normally contain relevant content matching the query: ${query}`,
        url: `${baseUrl}/mock-result-${i}`,
        publishedAt: new Date(Date.now() - Math.random() * (opts.days || 30) * 24 * 60 * 60 * 1000).toISOString(),
        platform
      });
    }
    
    console.log(`✅ Mock search returned ${results.length} results`);
    return results;
  }
}

// Bing Web Search API implementation (example)
export class BingWebSearch implements WebSearch {
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.endpoint = 'https://api.bing.microsoft.com/v7.0/search';
  }

  async search(query: string, opts: { days?: number; language?: string }): Promise<{ 
    title: string; 
    snippet: string; 
    url: string; 
    publishedAt?: string;
    platform?: Platform;
  }[]> {
    console.log('🔍 Bing web search for query:', query, 'with options:', opts);
    
    try {
      // Build search parameters
      const params = new URLSearchParams({
        q: query,
        count: '10',
        responseFilter: 'Webpages',
        mkt: opts.language ? `${opts.language}-US` : 'en-US'
      });

      // Add freshness filter if days specified
      if (opts.days) {
        if (opts.days <= 1) params.append('freshness', 'Day');
        else if (opts.days <= 7) params.append('freshness', 'Week');
        else if (opts.days <= 30) params.append('freshness', 'Month');
      }

      const response = await fetch(`${this.endpoint}?${params}`, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Bing API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Bing API response received');

      // Transform results
      const results = (data.webPages?.value || []).map((item: any) => ({
        title: item.name || 'Untitled',
        snippet: item.snippet || 'No description available',
        url: item.url,
        publishedAt: item.dateLastCrawled, // Bing doesn't provide exact publish date
        platform: this.detectPlatformFromUrl(item.url)
      }));

      console.log(`✅ Bing search returned ${results.length} results`);
      return results;

    } catch (error) {
      console.error('❌ Bing web search failed:', error);
      throw new Error(`Web search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private detectPlatformFromUrl(url: string): Platform | undefined {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      if (hostname.includes('facebook.com')) return 'facebook';
      if (hostname.includes('instagram.com')) return 'instagram';
      if (hostname.includes('pinterest.')) return 'pinterest';
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
      if (hostname.includes('tiktok.com')) return 'tiktok';
      if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
      if (hostname.includes('linkedin.com')) return 'linkedin';
      if (hostname.includes('spotify.com')) return 'spotify';
      return undefined;
    } catch {
      return undefined;
    }
  }
}

// Google Custom Search API implementation (example)
export class GoogleCustomSearch implements WebSearch {
  private apiKey: string;
  private searchEngineId: string;
  private endpoint: string;

  constructor(apiKey: string, searchEngineId: string) {
    this.apiKey = apiKey;
    this.searchEngineId = searchEngineId;
    this.endpoint = 'https://www.googleapis.com/customsearch/v1';
  }

  async search(query: string, opts: { days?: number; language?: string }): Promise<{ 
    title: string; 
    snippet: string; 
    url: string; 
    publishedAt?: string;
    platform?: Platform;
  }[]> {
    console.log('🔍 Google custom search for query:', query, 'with options:', opts);
    
    try {
      // Build search parameters
      const params = new URLSearchParams({
        key: this.apiKey,
        cx: this.searchEngineId,
        q: query,
        num: '10'
      });

      // Add language filter if specified
      if (opts.language) {
        params.append('lr', `lang_${opts.language}`);
      }

      // Note: Google Custom Search doesn't support date filtering in the free tier
      // You'd need to implement this in post-processing or upgrade to paid tier

      const response = await fetch(`${this.endpoint}?${params}`);

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Google API response received');

      // Transform results
      const results = (data.items || []).map((item: any) => ({
        title: item.title || 'Untitled',
        snippet: item.snippet || 'No description available',
        url: item.link,
        publishedAt: item.pagemap?.metatags?.[0]?.['article:published_time'] || 
                   item.pagemap?.metatags?.[0]?.['og:updated_time'],
        platform: this.detectPlatformFromUrl(item.link)
      }));

      console.log(`✅ Google search returned ${results.length} results`);
      return results;

    } catch (error) {
      console.error('❌ Google custom search failed:', error);
      throw new Error(`Web search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private detectPlatformFromUrl(url: string): Platform | undefined {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      if (hostname.includes('facebook.com')) return 'facebook';
      if (hostname.includes('instagram.com')) return 'instagram';
      if (hostname.includes('pinterest.')) return 'pinterest';
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
      if (hostname.includes('tiktok.com')) return 'tiktok';
      if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
      if (hostname.includes('linkedin.com')) return 'linkedin';
      if (hostname.includes('spotify.com')) return 'spotify';
      return undefined;
    } catch {
      return undefined;
    }
  }
}

// Factory function to create appropriate search provider
export function createWebSearch(provider: 'mock' | 'bing' | 'google', config: any): WebSearch {
  console.log('🏭 Creating web search provider:', provider);
  
  switch (provider) {
    case 'mock':
      return new MockWebSearch();
    
    case 'bing':
      if (!config.apiKey) {
        console.error('❌ Bing API key required');
        throw new Error('Bing API key required');
      }
      return new BingWebSearch(config.apiKey);
    
    case 'google':
      if (!config.apiKey || !config.searchEngineId) {
        console.error('❌ Google API key and search engine ID required');
        throw new Error('Google API key and search engine ID required');
      }
      return new GoogleCustomSearch(config.apiKey, config.searchEngineId);
    
    default:
      console.warn('⚠️ Unknown search provider, falling back to mock');
      return new MockWebSearch();
  }
}

// Enhanced search with retry logic and error handling
export class ResilientWebSearch implements WebSearch {
  private searchProvider: WebSearch;
  private maxRetries: number;
  private retryDelay: number;

  constructor(searchProvider: WebSearch, maxRetries = 3, retryDelay = 1000) {
    this.searchProvider = searchProvider;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  async search(query: string, opts: { days?: number; language?: string }): Promise<{ 
    title: string; 
    snippet: string; 
    url: string; 
    publishedAt?: string;
    platform?: Platform;
  }[]> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔍 Search attempt ${attempt}/${this.maxRetries}`);
        return await this.searchProvider.search(query, opts);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`⚠️ Search attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`❌ All ${this.maxRetries} search attempts failed`);
    throw lastError!;
  }
}

// Export default search provider (can be configured via environment variables)
export const defaultWebSearch = createWebSearch(
  (import.meta.env.VITE_SEARCH_PROVIDER as 'mock' | 'bing' | 'google') || 'mock',
  {
    apiKey: import.meta.env.VITE_BING_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY,
    searchEngineId: import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID
  }
);
