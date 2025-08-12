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
    name: 'youtube',
    displayName: 'YouTube',
    urlPattern: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    idExtractor: (url: string) => {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      return match ? match[1] : null;
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
  
  linkedin: {
    name: 'linkedin',
    displayName: 'LinkedIn',
    urlPattern: /linkedin\.com\/posts\/[^\/]+/,
    idExtractor: (url: string) => {
      const match = url.match(/linkedin\.com\/posts\/([^\/]+)/);
      return match ? match[1] : null;
    },
    apiSupported: false,
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
    linkedin: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/100px-LinkedIn_logo_initials.png',
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
    written: ['blog', 'twitter', 'linkedin'],
    image: ['instagram', 'pinterest', 'facebook'],
    document: ['blog', 'linkedin']
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
  if (!videoIds.length) return {};
  const ids = videoIds.join(",");
  const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch YouTube video stats");
  const data = await response.json();
  const result: Record<string, number> = {};
  (data.items || []).forEach((item: any) => {
    result[item.id] = parseInt(item.statistics.viewCount, 10);
  });
  return result;
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