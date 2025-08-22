/**
 * Link Image Fetcher Service
 * 
 * This service fetches images associated with links using various methods:
 * 1. Open Graph metadata (og:image)
 * 2. Twitter Card metadata (twitter:image)
 * 3. Schema.org metadata
 * 4. Fallback to first image found in HTML
 */

export interface LinkImageData {
  imageUrl: string;
  title?: string;
  description?: string;
  siteName?: string;
  type?: string;
  method: 'og' | 'twitter' | 'schema' | 'fallback';
}

export interface LinkImageFetchResult {
  success: boolean;
  data?: LinkImageData;
  error?: string;
}

class LinkImageFetcherService {
  private readonly CORS_PROXY_URL = 'https://api.allorigins.win/raw?url=';
  private readonly IMAGE_PROXY_URL = 'https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=';
  
  /**
   * Fetch image data from a URL
   * @param url - The URL to fetch image data from
   * @returns Promise<LinkImageFetchResult>
   */
  async fetchImageFromLink(url: string): Promise<LinkImageFetchResult> {
    try {
      // Validate URL
      if (!this.isValidUrl(url)) {
        return {
          success: false,
          error: 'Invalid URL provided'
        };
      }

      // Try to fetch using CORS proxy
      const response = await fetch(`${this.CORS_PROXY_URL}${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      return this.parseImageFromHTML(html, url);

    } catch (error) {
      console.error('Error fetching link image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Parse image data from HTML content
   * @param html - HTML content to parse
   * @param originalUrl - Original URL for fallback purposes
   * @returns LinkImageFetchResult
   */
  private parseImageFromHTML(html: string, originalUrl: string): LinkImageFetchResult {
    try {
      // Create a DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Try Open Graph first
      const ogImage = doc.querySelector('meta[property="og:image"]');
      if (ogImage) {
        const imageUrl = this.resolveImageUrl(ogImage.getAttribute('content') || '', originalUrl);
        if (imageUrl) {
          return {
            success: true,
            data: {
              imageUrl,
              title: this.getMetaContent(doc, 'og:title'),
              description: this.getMetaContent(doc, 'og:description'),
              siteName: this.getMetaContent(doc, 'og:site_name'),
              type: this.getMetaContent(doc, 'og:type'),
              method: 'og'
            }
          };
        }
      }

      // Try Twitter Card
      const twitterImage = doc.querySelector('meta[name="twitter:image"]');
      if (twitterImage) {
        const imageUrl = this.resolveImageUrl(twitterImage.getAttribute('content') || '', originalUrl);
        if (imageUrl) {
          return {
            success: true,
            data: {
              imageUrl,
              title: this.getMetaContent(doc, 'twitter:title'),
              description: this.getMetaContent(doc, 'twitter:description'),
              siteName: this.getMetaContent(doc, 'og:site_name'),
              type: 'twitter',
              method: 'twitter'
            }
          };
        }
      }

      // Try Schema.org
      const schemaImage = doc.querySelector('meta[itemprop="image"]');
      if (schemaImage) {
        const imageUrl = this.resolveImageUrl(schemaImage.getAttribute('content') || '', originalUrl);
        if (imageUrl) {
          return {
            success: true,
            data: {
              imageUrl,
              title: this.getMetaContent(doc, 'itemprop[name="name"]'),
              description: this.getMetaContent(doc, 'itemprop[name="description"]'),
              method: 'schema'
            }
          };
        }
      }

      // Fallback: find first image in HTML
      const firstImage = doc.querySelector('img');
      if (firstImage) {
        const imageUrl = this.resolveImageUrl(firstImage.getAttribute('src') || '', originalUrl);
        if (imageUrl) {
          return {
            success: true,
            data: {
              imageUrl,
              title: doc.querySelector('title')?.textContent || '',
              method: 'fallback'
            }
          };
        }
      }

      return {
        success: false,
        error: 'No image found in the link'
      };

    } catch (error) {
      console.error('Error parsing HTML:', error);
      return {
        success: false,
        error: 'Failed to parse HTML content'
      };
    }
  }

  /**
   * Get meta content by property name
   * @param doc - DOM document
   * @param property - Meta property name
   * @returns string or undefined
   */
  private getMetaContent(doc: Document, property: string): string | undefined {
    const meta = doc.querySelector(`meta[property="${property}"]`);
    return meta?.getAttribute('content') || undefined;
  }

  /**
   * Resolve relative image URLs to absolute URLs
   * @param imageUrl - Image URL (may be relative)
   * @param baseUrl - Base URL for resolution
   * @returns string or null
   */
  private resolveImageUrl(imageUrl: string, baseUrl: string): string | null {
    if (!imageUrl) return null;

    try {
      // If it's already an absolute URL, return as is
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }

      // Resolve relative URL
      const base = new URL(baseUrl);
      const resolved = new URL(imageUrl, base);
      return resolved.href;

    } catch (error) {
      console.error('Error resolving image URL:', error);
      return null;
    }
  }

  /**
   * Validate if a string is a valid URL
   * @param url - URL string to validate
   * @returns boolean
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get a proxied image URL to avoid CORS issues
   * @param imageUrl - Original image URL
   * @returns Proxied image URL
   */
  getProxiedImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    
    try {
      // Use Google's image proxy to avoid CORS issues
      return `${this.IMAGE_PROXY_URL}${encodeURIComponent(imageUrl)}`;
    } catch (error) {
      console.error('Error creating proxied image URL:', error);
      return imageUrl; // Fallback to original URL
    }
  }

  /**
   * Batch fetch images from multiple URLs
   * @param urls - Array of URLs to fetch images from
   * @returns Promise<Record<string, LinkImageFetchResult>>
   */
  async batchFetchImages(urls: string[]): Promise<Record<string, LinkImageFetchResult>> {
    const results: Record<string, LinkImageFetchResult> = {};
    
    // Process URLs in parallel with a concurrency limit
    const concurrencyLimit = 3;
    const chunks = this.chunkArray(urls, concurrencyLimit);
    
    for (const chunk of chunks) {
      const promises = chunk.map(url => 
        this.fetchImageFromLink(url).then(result => ({ url, result }))
      );
      
      const chunkResults = await Promise.all(promises);
      chunkResults.forEach(({ url, result }) => {
        results[url] = result;
      });
    }
    
    return results;
  }

  /**
   * Split array into chunks for batch processing
   * @param array - Array to split
   * @param chunkSize - Size of each chunk
   * @returns Array of chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

// Create singleton instance
const linkImageFetcherService = new LinkImageFetcherService();
export default linkImageFetcherService;
