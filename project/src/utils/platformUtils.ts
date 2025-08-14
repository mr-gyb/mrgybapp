/**
 * Platform Utilities
 * Handles platform detection, URL parsing, and ID extraction
 */

export interface PlatformInfo {
  name: string;
  displayName: string;
  urlPattern: RegExp;
  idExtractor: (url: string) => string | null;
  apiSupported: boolean;
  requiresAuth: boolean;
}

export const PLATFORMS: Record<string, PlatformInfo> = {
  youtube: {
    name: "youtube",
    displayName: "YouTube",
    urlPattern: /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    idExtractor: (url) => {
      // Handle various YouTube URL formats
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
        /youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return match[1];
        }
      }
      return null;
    },
    apiSupported: true,
    requiresAuth: true
  },
  
  instagram: {
    name: 'instagram',
    displayName: 'Instagram',
    urlPattern: /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
    idExtractor: (url: string) => {
      const match = url.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    },
    apiSupported: true,
    requiresAuth: true
  },
  
  tiktok: {
    name: 'tiktok',
    displayName: 'TikTok',
    urlPattern: /tiktok\.com\/@[^\/]+\/video\/(\d+)/,
    idExtractor: (url: string) => {
      const match = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
      return match ? match[1] : null;
    },
    apiSupported: true,
    requiresAuth: true
  },
  
  facebook: {
    name: 'facebook',
    displayName: 'Facebook',
    urlPattern: /facebook\.com\/[^\/]+\/posts\/(\d+)/,
    idExtractor: (url: string) => {
      const match = url.match(/facebook\.com\/[^\/]+\/posts\/(\d+)/);
      return match ? match[1] : null;
    },
    apiSupported: true,
    requiresAuth: true
  },
  
  pinterest: {
    name: 'pinterest',
    displayName: 'Pinterest',
    urlPattern: /pinterest\.com\/pin\/(\d+)/,
    idExtractor: (url: string) => {
      const match = url.match(/pinterest\.com\/pin\/(\d+)/);
      return match ? match[1] : null;
    },
    apiSupported: true,
    requiresAuth: true
  },
  
  spotify: {
    name: 'spotify',
    displayName: 'Spotify',
    urlPattern: /spotify\.com\/track\/([a-zA-Z0-9]+)/,
    idExtractor: (url: string) => {
      const match = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
      return match ? match[1] : null;
    },
    apiSupported: true,
    requiresAuth: true
  },
  
  twitter: {
    name: 'twitter',
    displayName: 'Twitter/X',
    urlPattern: /(?:twitter\.com|x\.com)\/[^\/]+\/status\/(\d+)/,
    idExtractor: (url: string) => {
      const match = url.match(/(?:twitter\.com|x\.com)\/[^\/]+\/status\/(\d+)/);
      return match ? match[1] : null;
    },
    apiSupported: true,
    requiresAuth: true
  },
  

  
  blog: {
    name: 'blog',
    displayName: 'Blog/Website',
    urlPattern: /^https?:\/\/[^\/]+/,
    idExtractor: (url: string) => {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname;
      } catch {
        return null;
      }
    },
    apiSupported: false,
    requiresAuth: false
  }
};

/**
 * Detect platform from URL
 */
export function detectPlatform(url: string): string | null {
  for (const [platformName, platform] of Object.entries(PLATFORMS)) {
    if (platform.urlPattern.test(url)) {
      return platformName;
    }
  }
  return null;
}

/**
 * Extract platform ID from URL
 */
export function extractPlatformId(url: string, platform: string): string | null {
  const platformInfo = PLATFORMS[platform.toLowerCase()];
  if (!platformInfo) {
    return null;
  }
  
  return platformInfo.idExtractor(url);
}

/**
 * Get platform display name
 */
export function getPlatformDisplayName(platform: string): string {
  return PLATFORMS[platform.toLowerCase()]?.displayName || platform;
}

/**
 * Check if platform supports API
 */
export function isPlatformApiSupported(platform: string): boolean {
  return PLATFORMS[platform.toLowerCase()]?.apiSupported || false;
}

/**
 * Check if platform requires authentication
 */
export function isPlatformAuthRequired(platform: string): boolean {
  return PLATFORMS[platform.toLowerCase()]?.requiresAuth || false;
}

/**
 * Get all supported platforms
 */
export function getSupportedPlatforms(): string[] {
  return Object.keys(PLATFORMS).filter(platform => 
    PLATFORMS[platform].apiSupported
  );
}

/**
 * Get platforms that require authentication
 */
export function getAuthRequiredPlatforms(): string[] {
  return Object.keys(PLATFORMS).filter(platform => 
    PLATFORMS[platform].requiresAuth
  );
}

/**
 * Validate URL for a specific platform
 */
export function validatePlatformUrl(url: string, platform: string): boolean {
  const platformInfo = PLATFORMS[platform.toLowerCase()];
  if (!platformInfo) {
    return false;
  }
  
  return platformInfo.urlPattern.test(url);
}

/**
 * Get platform icon/logo URL
 */
export function getPlatformIcon(platform: string): string {
  const iconMap: Record<string, string> = {
    youtube: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/100px-YouTube_full-color_icon_%282017%29.svg.png',
    instagram: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/100px-Instagram_logo_2016.svg.png',
    tiktok: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/100px-TikTok_logo.svg.png',
    facebook: '/facebook-icon.svg',
    pinterest: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Pinterest-logo_2015.svg/100px-Pinterest-logo_2015.svg.png',
    spotify: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/100px-Spotify_logo_without_text.svg.png',
    twitter: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/X_logo_2023.svg/100px-X_logo_2023.svg.png',

    blog: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Logo-red.svg/100px-Logo-red.svg.png'
  };
  
  return iconMap[platform.toLowerCase()] || '';
}

/**
 * Get default platforms for content type
 */
export function getDefaultPlatformsForContentType(contentType: string): string[] {
  const platformMap: Record<string, string[]> = {
    video: ['youtube', 'instagram', 'tiktok'],
    photo: ['instagram', 'pinterest', 'facebook'],
    audio: ['spotify', 'youtube'],
    written: ['blog', 'twitter'],
    image: ['instagram', 'pinterest', 'facebook'],
    document: ['blog']
  };
  
  return platformMap[contentType.toLowerCase()] || ['blog'];
} 

/**
 * Fetches YouTube video statistics (e.g., view count) for a list of video IDs.
 * @param {string[]} videoIds - Array of YouTube video IDs.
 * @param {string} apiKey - YouTube Data API v3 key.
 * @returns {Promise<Record<string, number>>} - Resolves to an object mapping videoId to viewCount.
 */
export async function fetchYouTubeViewCounts(videoIds: string[], apiKey: string): Promise<Record<string, number>> {
  if (!videoIds.length) {
    console.log('No video IDs provided for YouTube API call');
    return {};
  }
  
  if (!apiKey) {
    throw new Error('YouTube API key is required');
  }
  
  const ids = videoIds.join(",");
  const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${apiKey}`;
  
  console.log('Fetching YouTube data for videos:', videoIds);
  console.log('API URL:', url.replace(apiKey, '***API_KEY_HIDDEN***'));
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error response:', response.status, errorText);
      
      if (response.status === 403) {
        // Check if it's a quota exceeded error
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
            throw new Error('YouTube API quota exceeded. You have reached your daily limit. Try again tomorrow or upgrade your quota.');
          } else {
            throw new Error('YouTube API access forbidden. Check API key and permissions.');
          }
        } catch (parseError) {
          // If we can't parse the error, assume it's a permissions issue
          throw new Error('YouTube API access forbidden. Check API key and permissions.');
        }
      } else if (response.status === 400) {
        throw new Error('Invalid request to YouTube API. Check video IDs.');
      } else if (response.status === 429) {
        throw new Error('YouTube API rate limit exceeded. Try again later.');
      } else {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    console.log('YouTube API response data:', data);
    
    if (data.error) {
      throw new Error(`YouTube API error: ${data.error.message}`);
    }
    
    const result: Record<string, number> = {};
    (data.items || []).forEach((item: any) => {
      const viewCount = parseInt(item.statistics?.viewCount || '0', 10);
      result[item.id] = viewCount;
      console.log(`Video ${item.id}: ${viewCount} views`);
    });
    
    console.log('Final YouTube view counts:', result);
    return result;
    
  } catch (error) {
    console.error('Error fetching YouTube view counts:', error);
    throw error;
  }
} 

/**
 * Fetches YouTube channel statistics (e.g., total view count) for a given channel ID.
 * @param {string} channelId - YouTube channel ID.
 * @param {string} apiKey - YouTube Data API v3 key.
 * @returns {Promise<{viewCount: number, subscriberCount: number, videoCount: number}>}
 */
export async function fetchYouTubeChannelStats(channelId: string, apiKey: string): Promise<{viewCount: number, subscriberCount: number, videoCount: number}> {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch YouTube channel stats");
  const data = await response.json();
  const stats = data.items?.[0]?.statistics;
  return {
    viewCount: stats ? parseInt(stats.viewCount, 10) : 0,
    subscriberCount: stats ? parseInt(stats.subscriberCount, 10) : 0,
    videoCount: stats ? parseInt(stats.videoCount, 10) : 0,
  };
}

// Additional utility functions for YouTube API integration
export function validateYouTubeUrl(url: string): boolean {
  return PLATFORMS.youtube.urlPattern.test(url);
}

export function extractYouTubeVideoId(url: string): string | null {
  return PLATFORMS.youtube.idExtractor(url);
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function getYouTubeThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' = 'medium'): string {
  const qualityMap = {
    default: 'default.jpg',
    medium: 'mqdefault.jpg',
    high: 'hqdefault.jpg'
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}`;
}

export function isYouTubeContent(content: any): boolean {
  return content.platforms?.some((p: string) => p.toLowerCase() === 'youtube') && 
         content.type === 'video' && 
         content.originalUrl;
}

export function getYouTubeContentItems(contentArray: any[]): any[] {
  return contentArray.filter(isYouTubeContent);
}

// Test function for YouTube API integration
export async function testYouTubeAPI(apiKey: string, testVideoId: string = 'dQw4w9WgXcQ'): Promise<{success: boolean, data?: any, error?: string}> {
  try {
    console.log('🧪 Testing YouTube API integration...');
    console.log('API Key:', apiKey ? 'Present' : 'Missing');
    console.log('Test Video ID:', testVideoId);
    
    if (!apiKey) {
      return { success: false, error: 'YouTube API key is required' };
    }
    
    const result = await fetchYouTubeViewCounts([testVideoId], apiKey);
    console.log('✅ YouTube API test successful:', result);
    
    return { 
      success: true, 
      data: result 
    };
  } catch (error) {
    console.error('❌ YouTube API test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 