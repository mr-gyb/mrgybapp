import { useState, useEffect, useCallback, useRef } from 'react';
import linkImageFetcherService, { LinkImageData, LinkImageFetchResult } from '../services/linkImageFetcher.service';

export interface UseLinkImageFetcherReturn {
  // State
  linkImages: Record<string, LinkImageData>;
  isLoading: Record<string, boolean>;
  errors: Record<string, string>;
  
  // Actions
  fetchImageForLink: (url: string) => Promise<void>;
  fetchImagesForLinks: (urls: string[]) => Promise<void>;
  clearImage: (url: string) => void;
  clearAllImages: () => void;
  
  // Utilities
  hasImage: (url: string) => boolean;
  getImage: (url: string) => LinkImageData | undefined;
  isImageLoading: (url: string) => boolean;
  getImageError: (url: string) => string | undefined;
}

/**
 * Hook for managing link image fetching
 * Automatically fetches images for links and manages loading/error states
 */
export function useLinkImageFetcher(): UseLinkImageFetcherReturn {
  const [linkImages, setLinkImages] = useState<Record<string, LinkImageData>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Track ongoing requests to prevent duplicate fetches
  const ongoingRequests = useRef<Set<string>>(new Set());
  
  /**
   * Fetch image for a single link
   */
  const fetchImageForLink = useCallback(async (url: string) => {
    if (!url || ongoingRequests.current.has(url)) return;
    
    // Mark as loading
    setIsLoading(prev => ({ ...prev, [url]: true }));
    setErrors(prev => ({ ...prev, [url]: '' }));
    ongoingRequests.current.add(url);
    
    try {
      const result = await linkImageFetcherService.fetchImageFromLink(url);
      
      if (result.success && result.data) {
        setLinkImages(prev => ({ ...prev, [url]: result.data! }));
      } else {
        setErrors(prev => ({ ...prev, [url]: result.error || 'Failed to fetch image' }));
      }
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        [url]: error instanceof Error ? error.message : 'Unknown error occurred' 
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, [url]: false }));
      ongoingRequests.current.delete(url);
    }
  }, []);
  
  /**
   * Fetch images for multiple links
   */
  const fetchImagesForLinks = useCallback(async (urls: string[]) => {
    const validUrls = urls.filter(url => url && !ongoingRequests.current.has(url));
    
    if (validUrls.length === 0) return;
    
    // Mark all as loading
    setIsLoading(prev => {
      const newLoading = { ...prev };
      validUrls.forEach(url => newLoading[url] = true);
      return newLoading;
    });
    
    // Clear previous errors
    setErrors(prev => {
      const newErrors = { ...prev };
      validUrls.forEach(url => newErrors[url] = '');
      return newErrors;
    });
    
    // Add to ongoing requests
    validUrls.forEach(url => ongoingRequests.current.add(url));
    
    try {
      const results = await linkImageFetcherService.batchFetchImages(validUrls);
      
      // Process results
      const newImages: Record<string, LinkImageData> = {};
      const newErrors: Record<string, string> = {};
      
      validUrls.forEach(url => {
        const result = results[url];
        if (result?.success && result.data) {
          newImages[url] = result.data;
        } else {
          newErrors[url] = result?.error || 'Failed to fetch image';
        }
      });
      
      // Update state
      setLinkImages(prev => ({ ...prev, ...newImages }));
      setErrors(prev => ({ ...prev, ...newErrors }));
      
    } catch (error) {
      // Mark all as failed
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrors(prev => {
        const newErrors = { ...prev };
        validUrls.forEach(url => newErrors[url] = errorMessage);
        return newErrors;
      });
    } finally {
      // Mark all as not loading
      setIsLoading(prev => {
        const newLoading = { ...prev };
        validUrls.forEach(url => newLoading[url] = false);
        return newLoading;
      });
      
      // Remove from ongoing requests
      validUrls.forEach(url => ongoingRequests.current.delete(url));
    }
  }, []);
  
  /**
   * Clear image for a specific link
   */
  const clearImage = useCallback((url: string) => {
    setLinkImages(prev => {
      const newImages = { ...prev };
      delete newImages[url];
      return newImages;
    });
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[url];
      return newErrors;
    });
  }, []);
  
  /**
   * Clear all images
   */
  const clearAllImages = useCallback(() => {
    setLinkImages({});
    setErrors({});
    setIsLoading({});
    ongoingRequests.current.clear();
  }, []);
  
  /**
   * Check if a link has an image
   */
  const hasImage = useCallback((url: string): boolean => {
    return !!linkImages[url];
  }, [linkImages]);
  
  /**
   * Get image data for a link
   */
  const getImage = useCallback((url: string): LinkImageData | undefined => {
    return linkImages[url];
  }, [linkImages]);
  
  /**
   * Check if a link is currently loading
   */
  const isImageLoading = useCallback((url: string): boolean => {
    return !!isLoading[url];
  }, [isLoading]);
  
  /**
   * Get error for a link
   */
  const getImageError = useCallback((url: string): string | undefined => {
    return errors[url];
  }, [errors]);
  
  return {
    linkImages,
    isLoading,
    errors,
    fetchImageForLink,
    fetchImagesForLinks,
    clearImage,
    clearAllImages,
    hasImage,
    getImage,
    isImageLoading,
    getImageError
  };
}
