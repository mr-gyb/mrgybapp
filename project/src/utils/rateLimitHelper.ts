/**
 * Rate Limit Helper
 * Provides utilities for handling API rate limiting
 */

export interface RateLimitInfo {
  limit: number;
  used: number;
  remaining: number;
  resetTime?: number;
  retryAfter?: number;
}

export const rateLimitHelper = {
  /**
   * Check if an error is a rate limit error
   */
  isRateLimitError: (error: any): boolean => {
    if (error instanceof Error) {
      return error.message.includes('429') || 
             error.message.includes('Rate limit') || 
             error.message.includes('Too Many Requests');
    }
    return false;
  },

  /**
   * Extract rate limit information from error message
   */
  extractRateLimitInfo: (error: any): RateLimitInfo | null => {
    if (!rateLimitHelper.isRateLimitError(error)) {
      return null;
    }

    const message = error.message || '';
    
    // Try to extract limit info from OpenAI error messages
    const limitMatch = message.match(/Limit (\d+)/);
    const usedMatch = message.match(/Used (\d+)/);
    const retryAfterMatch = message.match(/try again in ([\d.]+)s/);
    
    if (limitMatch && usedMatch) {
      const limit = parseInt(limitMatch[1]);
      const used = parseInt(usedMatch[1]);
      const remaining = limit - used;
      const retryAfter = retryAfterMatch ? parseFloat(retryAfterMatch[1]) : undefined;
      
      return {
        limit,
        used,
        remaining,
        retryAfter
      };
    }
    
    return null;
  },

  /**
   * Get user-friendly rate limit message
   */
  getRateLimitMessage: (error: any): string => {
    const info = rateLimitHelper.extractRateLimitInfo(error);
    
    if (info) {
      return `
Rate Limit Reached!

You've hit the OpenAI API rate limit:
- Limit: ${info.limit.toLocaleString()} tokens per minute
- Used: ${info.used.toLocaleString()} tokens
- Remaining: ${info.remaining.toLocaleString()} tokens
${info.retryAfter ? `- Retry after: ${info.retryAfter} seconds` : ''}

This is a temporary limitation. Please wait a moment before trying again.
      `.trim();
    }
    
    return `
Rate Limit Reached!

You've hit the OpenAI API rate limit. This is a temporary limitation.
Please wait a moment before trying again.
    `.trim();
  },

  /**
   * Calculate delay before retry
   */
  getRetryDelay: (error: any): number => {
    const info = rateLimitHelper.extractRateLimitInfo(error);
    
    if (info?.retryAfter) {
      // Add some buffer to the retry time
      return Math.ceil(info.retryAfter * 1000) + 1000;
    }
    
    // Default retry delay
    return 5000; // 5 seconds
  },

  /**
   * Create a retry function with exponential backoff
   */
  createRetryFunction: <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ) => {
    return async (): Promise<T> => {
      let lastError: any;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error;
          
          if (rateLimitHelper.isRateLimitError(error)) {
            const delay = rateLimitHelper.getRetryDelay(error);
            console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt);
            console.log(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            break;
          }
        }
      }
      
      throw lastError;
    };
  }
};

export default rateLimitHelper;
