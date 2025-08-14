export interface UrlValidationResult {
  isValid: boolean;
  statusCode?: number;
  isAccessible: boolean;
  hasPaywall: boolean;
  isGeoBlocked: boolean;
  error?: string;
  cleanedUrl: string;
}

export interface ValidationOptions {
  timeout?: number;
  userAgent?: string;
  checkPaywall?: boolean;
  checkGeoBlock?: boolean;
}

export class UrlValidationService {
  private static readonly DEFAULT_TIMEOUT = 10000; // 10 seconds
  private static readonly DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

  /**
   * Clean URL by removing tracking parameters
   */
  static cleanUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const searchParams = urlObj.searchParams;
      
      // Remove common tracking parameters
      const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'fbclid', 'gclid', 'msclkid', 'ref', 'source', 'campaign',
        'mc_cid', 'mc_eid', 'mc_tc', 'mc_rid'
      ];
      
      trackingParams.forEach(param => searchParams.delete(param));
      
      return urlObj.toString();
    } catch (error) {
      console.error('Error cleaning URL:', error);
      return url;
    }
  }

  /**
   * Validate URL accessibility and content
   */
  static async validateUrl(url: string, options: ValidationOptions = {}): Promise<UrlValidationResult> {
    const {
      timeout = this.DEFAULT_TIMEOUT,
      userAgent = this.DEFAULT_USER_AGENT,
      checkPaywall = true,
      checkGeoBlock = true
    } = options;

    const cleanedUrl = this.cleanUrl(url);
    
    try {
      // For now, return mock validation (replace with actual backend validation)
      // In production, this would make a server-side request to validate the URL
      
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Mock validation logic - replace with actual implementation
      const isValid = await this.performMockValidation(cleanedUrl);
      
      if (isValid) {
        return {
          isValid: true,
          statusCode: 200,
          isAccessible: true,
          hasPaywall: false,
          isGeoBlocked: false,
          cleanedUrl
        };
      } else {
        return {
          isValid: false,
          statusCode: 404,
          isAccessible: false,
          hasPaywall: false,
          isGeoBlocked: false,
          error: 'URL not accessible',
          cleanedUrl
        };
      }
    } catch (error) {
      return {
        isValid: false,
        isAccessible: false,
        hasPaywall: false,
        isGeoBlocked: false,
        error: error instanceof Error ? error.message : 'Validation failed',
        cleanedUrl
      };
    }
  }

  /**
   * Batch validate multiple URLs
   */
  static async validateUrls(urls: string[], options: ValidationOptions = {}): Promise<Map<string, UrlValidationResult>> {
    const results = new Map<string, UrlValidationResult>();
    
    // Process URLs in parallel with concurrency limit
    const concurrencyLimit = 5;
    const chunks = this.chunkArray(urls, concurrencyLimit);
    
    for (const chunk of chunks) {
      const promises = chunk.map(async (url) => {
        const result = await this.validateUrl(url, options);
        return { url, result };
      });
      
      const chunkResults = await Promise.all(promises);
      chunkResults.forEach(({ url, result }) => {
        results.set(url, result);
      });
    }
    
    return results;
  }

  /**
   * Check if URL is from a supported platform
   */
  static isSupportedPlatform(url: string): boolean {
    const supportedDomains = [
      'youtube.com', 'youtu.be', 'instagram.com', 'spotify.com', 'open.spotify.com',
      'tiktok.com', 'pinterest.com', 'twitter.com', 'facebook.com', 'fb.com',
      'linkedin.com', 'medium.com', 'substack.com', 'newsletter.com'
    ];
    
    try {
      const domain = new URL(url).hostname.toLowerCase();
      return supportedDomains.some(supported => domain.includes(supported));
    } catch {
      return false;
    }
  }

  /**
   * Extract platform from URL
   */
  static extractPlatform(url: string): string {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      if (domain.includes('youtube.com') || domain.includes('youtu.be')) return 'YouTube';
      if (domain.includes('instagram.com')) return 'Instagram';
      if (domain.includes('spotify.com') || domain.includes('open.spotify.com')) return 'Spotify';
      if (domain.includes('tiktok.com')) return 'TikTok';
      if (domain.includes('pinterest.com')) return 'Pinterest';
      if (domain.includes('twitter.com')) return 'Twitter';
      if (domain.includes('facebook.com') || domain.includes('fb.com')) return 'Facebook';
      if (domain.includes('linkedin.com')) return 'LinkedIn';
      if (domain.includes('medium.com')) return 'Medium';
      if (domain.includes('substack.com')) return 'Substack';
      
      return 'Other';
    } catch {
      return 'Other';
    }
  }

  /**
   * Check for common paywall indicators
   */
  static async checkPaywallIndicators(url: string): Promise<boolean> {
    // Mock implementation - replace with actual paywall detection
    // In production, this would analyze the page content for paywall indicators
    
    const paywallKeywords = [
      'subscribe', 'premium', 'paywall', 'membership', 'upgrade',
      'unlock', 'exclusive', 'pro', 'plus', 'premium content'
    ];
    
    // Simulate paywall check
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock result - 10% chance of paywall
    return Math.random() < 0.1;
  }

  /**
   * Check for geo-blocking
   */
  static async checkGeoBlocking(url: string): Promise<boolean> {
    // Mock implementation - replace with actual geo-blocking detection
    // In production, this would check from different geographic locations
    
    // Simulate geo-blocking check
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock result - 5% chance of geo-blocking
    return Math.random() < 0.05;
  }

  /**
   * Helper method to chunk array for concurrency control
   */
  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Mock validation for demonstration purposes
   * Replace with actual backend validation logic
   */
  private static async performMockValidation(url: string): Promise<boolean> {
    // Simulate different validation scenarios based on URL
    const domain = new URL(url).hostname.toLowerCase();
    
    // Simulate some URLs failing validation
    if (domain.includes('example.com') || domain.includes('test.com')) {
      return false;
    }
    
    // Simulate network delays and occasional failures
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
    
    // 90% success rate for demo
    return Math.random() > 0.1;
  }
}

// Export singleton instance
export const urlValidationService = new UrlValidationService();
