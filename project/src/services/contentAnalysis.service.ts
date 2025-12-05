import OpenAI from 'openai';
import { ContentItem } from '../types/content';

// Types for the content analysis system
export type Platform = 'facebook' | 'instagram' | 'pinterest' | 'youtube' | 'tiktok' | 'twitter' | 'linkedin' | 'spotify';

export interface ContentAnalysis {
  global_summary: {
    total_items: number;
    dominant_themes: string[];
    overall_tone: string;
    primary_language: string;
    language: string;
    content_diversity_score: number;
  };
  platforms: Platform[];
  per_platform: Record<Platform, {
    present: boolean;
    themes: string[];
    tones: string[];
    keywords: string[];
    hashtags: string[];
    content_types: string[];
    recommended_time_window_days: number;
    engagement_patterns?: string[];
    audience_insights?: string[];
  }>;
}

export interface InspirationQuery {
  platform: Platform;
  queries: string[];
  timeWindowDays: number;
  language?: string;
}

export interface Candidate {
  platform: Platform;
  title?: string;
  snippet?: string;
  url: string;
  publishedAt?: string;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Platform detection function
export function detectPlatform(url: string): Platform | null {
  try {
    console.log('🔍 Detecting platform for URL:', url);
    const hostname = new URL(url).hostname.toLowerCase();
    
    if (hostname.includes('facebook.com')) return 'facebook';
    if (hostname.includes('instagram.com')) return 'instagram';
    if (hostname.includes('pinterest.')) return 'pinterest';
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
    if (hostname.includes('tiktok.com')) return 'tiktok';
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
    if (hostname.includes('linkedin.com')) return 'linkedin';
    if (hostname.includes('spotify.com')) return 'spotify';
    
    console.log('⚠️ No platform detected for URL:', url);
    return null;
  } catch (error) {
    console.error('❌ Error detecting platform for URL:', url, error);
    return null;
  }
}

// Build analysis prompt
function buildAnalysisPrompt(items: ContentItem[]) {
  console.log('📝 Building analysis prompt for', items.length, 'items');
  
  // Enhance items with video analysis data if available
  const enhancedItems = items.map(item => {
    // If this is a video with analysis data in generatedAssets, extract it
    if (item.type === 'video' && item.generatedAssets) {
      const analysisAsset = item.generatedAssets.find(asset => asset.type === 'analysis');
      if (analysisAsset && analysisAsset.content) {
        try {
          const analysisData = JSON.parse(analysisAsset.content);
          // Merge analysis data into the item for better analysis
          return {
            ...item,
            videoAnalysis: analysisData
          };
        } catch (e) {
          console.warn('Failed to parse video analysis data:', e);
        }
      }
    }
    return item;
  });
  
  return [
    {
      role: "system" as const,
      content: `You are a content analyst for a social media "Content Hub." Summarize uploaded posts and return structured JSON following the provided schema. Extract themes, tones, keywords, hashtags, visual motifs, audience, and per-platform guidance. Do not fabricate platforms. Never include platforms that are not present in the uploads. Prefer concise, high-signal outputs.

IMPORTANT: For video content items that include videoAnalysis data (with summary, keyPoints, transcript, mainTheme), use this analysis data to provide more accurate and detailed insights. The videoAnalysis data contains AI-generated analysis of the video content that should be incorporated into your analysis.`
    },
    {
      role: "user" as const,
      content: `Analyze the following uploaded items. Output only valid JSON matching the ContentAnalysis schema you've been given.

Uploaded items (JSON):
${JSON.stringify(enhancedItems, null, 2)}

Constraints:
- Identify which platforms are present across the uploads.
- Provide a global summary, then per-platform chunks.
- For each present platform, provide themes, tones, keywords, hashtags, content_types, and a recommended_time_window_days for finding similar high-performing inspiration.
- If a platform is not present, set present: false and leave arrays empty.
- For video items with videoAnalysis data, incorporate the analysis summary, keyPoints, mainTheme, and transcript insights into your analysis.

Return only valid JSON.`
    }
  ];
}

// Main content analysis function
export async function analyzeContent(items: ContentItem[]): Promise<ContentAnalysis> {
  console.log('🚀 Starting content analysis for', items.length, 'items');
  
  try {
    // Validate input
    if (!items || items.length === 0) {
      console.warn('⚠️ No items provided for analysis');
      throw new Error('No content items provided for analysis');
    }

    // Filter out default content
    const realContent = items.filter(item => !item.id.startsWith('default-'));
    console.log('📊 Filtered to', realContent.length, 'real content items');

    if (realContent.length === 0) {
      console.warn('⚠️ No real content items found after filtering');
      throw new Error('No real content items found for analysis');
    }

    // Check OpenAI API key
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }

    console.log('🔑 OpenAI API key found, proceeding with analysis');

    // Call OpenAI with structured output
    const response = await openai.chat.completions.create({
      model: 'o3-mini',
      messages: buildAnalysisPrompt(realContent),
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.3,
    });

    console.log('✅ OpenAI response received');

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('❌ No content in OpenAI response');
      throw new Error('No analysis content received from OpenAI');
    }

    console.log('📄 Raw OpenAI response:', content);

    // Parse JSON response
    let analysis: ContentAnalysis;
    try {
      analysis = JSON.parse(content);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('📄 Failed content:', content);
      
      // Retry with stricter prompt
      console.log('🔄 Retrying with stricter JSON prompt...');
      const retryResponse = await openai.chat.completions.create({
        model: 'o3-mini',
        messages: [
          {
            role: "system" as const,
            content: "Return strictly valid JSON that matches the schema. Do not include prose."
          },
          {
            role: "user" as const,
            content: `Analyze the following uploaded items and produce platform-aware themes, tones, keywords, hashtags, visual motifs, and suggested time windows. Platforms must only include those present in the uploads.

Uploaded items (JSON):
${JSON.stringify(realContent, null, 2)}

Return only valid JSON.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.1,
      });

      const retryContent = retryResponse.choices[0]?.message?.content;
      if (!retryContent) {
        throw new Error('Retry attempt also failed');
      }

      analysis = JSON.parse(retryContent);
      console.log('✅ Retry successful, JSON parsed');
    }

    // Validate analysis structure
    if (!analysis.global_summary || !analysis.platforms || !analysis.per_platform) {
      console.error('❌ Invalid analysis structure:', analysis);
      throw new Error('Analysis response has invalid structure');
    }

    console.log('✅ Analysis validation passed');
    console.log('📊 Analysis result:', analysis);

    return analysis;

  } catch (error) {
    console.error('❌ Content analysis failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        console.error('🚫 Rate limit exceeded');
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.message.includes('quota')) {
        console.error('💰 Quota exceeded');
        throw new Error('API quota exceeded. Please try again later.');
      } else if (error.message.includes('timeout')) {
        console.error('⏰ Request timeout');
        throw new Error('Request timeout. Please try again.');
      }
    }
    
    throw new Error(`Content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Build inspiration queries
export function buildQueries(analysis: ContentAnalysis): InspirationQuery[] {
  console.log('🔍 Building inspiration queries for platforms:', analysis.platforms);
  
  const out: InspirationQuery[] = [];
  
  for (const platform of analysis.platforms) {
    const platformData = analysis.per_platform[platform];
    
    if (!platformData.present) {
      console.log(`⏭️ Skipping ${platform} - not present in content`);
      continue;
    }

    console.log(`📝 Building queries for ${platform}`);
    
    const keywords = (platformData.keywords || []).slice(0, 8);
    const hashtags = (platformData.hashtags || []).slice(0, 5);
    const terms = [...keywords, ...hashtags.map(t => t.replace(/^#/, ""))].filter(Boolean);

    console.log(`🔑 Keywords for ${platform}:`, keywords);
    console.log(`🏷️ Hashtags for ${platform}:`, hashtags);

    // Platform-scoped operators
    const siteFilter = getPlatformSiteFilter(platform);

    // Compose several queries (mix-and-match)
    const qBase = terms.length ? `"${terms.join('" OR "')}"` : "";
    const queries = [
      [siteFilter, qBase, "reel OR video OR carousel OR post"].filter(Boolean).join(" "),
      [siteFilter, qBase, "trending OR viral"].filter(Boolean).join(" "),
      [siteFilter, qBase].filter(Boolean).join(" "),
    ];

    const query: InspirationQuery = {
      platform,
      queries,
      timeWindowDays: Math.max(7, Math.min(180, platformData.recommended_time_window_days || 30)),
      language: analysis.global_summary.language
    };

    console.log(`✅ Built queries for ${platform}:`, query);
    out.push(query);
  }

  console.log(`🎯 Total queries built:`, out.length);
  return out;
}

// Get platform-specific site filter
function getPlatformSiteFilter(platform: Platform): string {
  switch (platform) {
    case 'facebook': return 'site:facebook.com';
    case 'instagram': return 'site:instagram.com';
    case 'pinterest': return 'site:pinterest.com';
    case 'youtube': return 'site:youtube.com';
    case 'tiktok': return 'site:tiktok.com';
    case 'twitter': return 'site:twitter.com';
    case 'linkedin': return 'site:linkedin.com';
    case 'spotify': return 'site:spotify.com';
    default: return '';
  }
}

// Score candidate content
export function scoreCandidate(c: Candidate, query: InspirationQuery, embeddings?: {post: number[]; candidate: number[]}) {
  console.log(`📊 Scoring candidate for ${c.platform}:`, c.url);
  
  const recency = c.publishedAt ? 1 / (1 + daysAgo(c.publishedAt)) : 0.2;
  const popularity = (c.likeCount ?? 0) * 1 + (c.commentCount ?? 0) * 3 + (c.shareCount ?? 0) * 4;
  const relevance = embeddings ? calculateCosineSimilarity(embeddings.post, embeddings.candidate) : 1.0;
  
  const score = 0.55 * relevance + 0.25 * recency + 0.20 * Math.log10(1 + popularity);
  
  console.log(`📈 Score breakdown for ${c.url}:`, {
    recency: recency.toFixed(3),
    popularity: popularity.toFixed(0),
    relevance: relevance.toFixed(3),
    finalScore: score.toFixed(3)
  });
  
  return score;
}

// Calculate days ago
function daysAgo(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate cosine similarity (placeholder for embeddings)
function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Normalize URL for deduplication
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
  } catch {
    return url;
  }
}

// Main inspiration function
export async function getInspiration(analysis: ContentAnalysis, items: ContentItem[], topN = 3) {
  console.log('🎯 Getting inspiration for', items.length, 'items, top', topN);
  
  try {
    const queries = buildQueries(analysis);
    const presentPlatforms = new Set(analysis.platforms);

    console.log('🔍 Present platforms:', Array.from(presentPlatforms));
    console.log('📝 Built queries:', queries.length);

    const all: Candidate[] = [];
    
    // Import web search service dynamically to avoid circular dependencies
    const { defaultWebSearch } = await import('./webSearch.service');
    
    // Fetch candidates using web search
    for (const q of queries) {
      console.log(`🔍 Searching for ${q.platform} with queries:`, q.queries);
      
      try {
        // Execute each query
        for (const queryString of q.queries) {
          console.log(`🔍 Executing query: "${queryString}"`);
          
          const searchResults = await defaultWebSearch.search(queryString, {
            days: q.timeWindowDays,
            language: q.language
          });
          
          // Transform search results to candidates
          const candidates: Candidate[] = searchResults
            .filter(result => result.platform === q.platform) // Ensure platform match
            .map(result => ({
              platform: q.platform,
              title: result.title,
              snippet: result.snippet,
              url: result.url,
              publishedAt: result.publishedAt,
              likeCount: undefined, // Not available from web search
              commentCount: undefined,
              shareCount: undefined
            }));
          
          all.push(...candidates);
          console.log(`✅ Added ${candidates.length} candidates for query: "${queryString}"`);
        }
        
      } catch (searchError) {
        console.error(`❌ Search failed for ${q.platform}:`, searchError);
        // Continue with other platforms/queries
      }
    }

    if (all.length === 0) {
      console.warn('⚠️ No candidates found from web search');
      // Fallback to mock candidates for testing
      console.log('🔄 Falling back to mock candidates');
      for (const q of queries) {
        const mockCandidates = createMockCandidates(q);
        all.push(...mockCandidates);
      }
    }

    // Deduplicate by URL
    const deduped = [...new Map(all.map(c => [normalizeUrl(c.url), c])).values()];
    console.log(`🔄 Deduplicated from ${all.length} to ${deduped.length} candidates`);

    // Filter strictly to present platforms only
    const filtered = deduped.filter(c => presentPlatforms.has(c.platform));
    console.log(`✅ Filtered to ${filtered.length} candidates from present platforms`);

    // Score and sort
    const scored = filtered
      .map(c => ({ 
        c, 
        score: scoreCandidate(c, queries.find(x => x.platform === c.platform)!) 
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .map(({c}) => c);

    console.log(`🏆 Top ${scored.length} scored candidates:`, scored);
    return scored;

  } catch (error) {
    console.error('❌ Error getting inspiration:', error);
    throw error;
  }
}

// Create mock candidates for testing (remove in production)
function createMockCandidates(query: InspirationQuery): Candidate[] {
  const mockUrls = [
    `https://${query.platform}.com/mock-post-1`,
    `https://${query.platform}.com/mock-post-2`,
    `https://${query.platform}.com/mock-post-3`
  ];

  return mockUrls.map((url, index) => ({
    platform: query.platform,
    title: `Mock ${query.platform} Post ${index + 1}`,
    snippet: `This is a mock ${query.platform} post for testing purposes`,
    url,
    publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    likeCount: Math.floor(Math.random() * 1000),
    commentCount: Math.floor(Math.random() * 100),
    shareCount: Math.floor(Math.random() * 50)
  }));
}

// Error handling utilities
export function handleAnalysisError(error: any): string {
  console.error('🚨 Analysis error occurred:', error);
  
  if (error instanceof Error) {
    if (error.message.includes('rate limit')) {
      return 'Service temporarily unavailable due to high demand. Please try again in a few minutes.';
    } else if (error.message.includes('quota')) {
      return 'Service quota exceeded. Please try again later.';
    } else if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    } else if (error.message.includes('API key')) {
      return 'Configuration error. Please contact support.';
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
}

// Circuit breaker for repeated failures
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 3;
  private readonly timeout = 60000; // 60 seconds

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      console.log('🚫 Circuit breaker is open, rejecting request');
      throw new Error('Service temporarily unavailable. Please try again in a minute.');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    return this.failures >= this.threshold && 
           (Date.now() - this.lastFailureTime) < this.timeout;
  }

  private onSuccess(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    console.log(`❌ Circuit breaker failure count: ${this.failures}`);
  }
}

// Export circuit breaker instance
export const analysisCircuitBreaker = new CircuitBreaker();
