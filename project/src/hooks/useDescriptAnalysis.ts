import { useState, useCallback } from 'react';

export interface VideoSegment {
  startTime: number; // Start timestamp in seconds
  endTime: number; // End timestamp in seconds
  title: string; // Compelling title (5-10 words)
  caption: string; // Engaging caption for social media
  description: string; // Detailed description explaining viral potential
  hashtags: string[]; // Array of relevant hashtags (without #)
  hook: string; // The actual opening line/text from this segment
}

export interface DescriptAnalysisResult {
  summary: string;
  highlights: string[];
  transcript: string;
  segments?: VideoSegment[]; // New: segments with timestamps and metadata
  duration?: number; // Video duration in seconds
}

export interface DescriptAnalysisError {
  message: string;
  code?: string;
  suggestion?: string;
  retryAfter?: number;
  isQuota?: boolean;
  isRateLimit?: boolean;
  errorType?: string;
}

export interface UseDescriptAnalysisReturn {
  /**
   * Upload and analyze media file using Descript API
   */
  analyzeMedia: (file: File) => Promise<void>;
  
  /**
   * Analysis result (null if not yet analyzed or if error occurred)
   */
  result: DescriptAnalysisResult | null;
  
  /**
   * Error object (null if no error)
   */
  error: DescriptAnalysisError | null;
  
  /**
   * Whether analysis is currently in progress
   */
  isLoading: boolean;
  
  /**
   * Reset the hook state (clear result and error)
   */
  reset: () => void;
}

/**
 * React hook for video media analysis (OpenAI Whisper + GPT pipeline)
 * 
 * Uploads media files, transcribes with Whisper, analyzes with GPT-4/4o,
 * and returns structured analysis results including:
 * - Full transcript
 * - Summary and highlights
 * - Segments with timestamps for short-form content generation
 * - Metadata (titles, captions, descriptions, hashtags) for each segment
 * 
 * @example
 * ```tsx
 * const { analyzeMedia, result, error, isLoading, reset } = useDescriptAnalysis();
 * 
 * const handleFileUpload = async (file: File) => {
 *   await analyzeMedia(file);
 * };
 * 
 * return (
 *   <div>
 *     {isLoading && <p>Analyzing media...</p>}
 *     {error && <p>Error: {error.message}</p>}
 *     {result && (
 *       <div>
 *         <h3>Summary</h3>
 *         <p>{result.summary}</p>
 *         <h3>Highlights</h3>
 *         <ul>{result.highlights.map(h => <li key={h}>{h}</li>)}</ul>
 *         <h3>Transcript</h3>
 *         <p>{result.transcript}</p>
 *       </div>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useDescriptAnalysis(): UseDescriptAnalysisReturn {
  const [result, setResult] = useState<DescriptAnalysisResult | null>(null);
  const [error, setError] = useState<DescriptAnalysisError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeMedia = useCallback(async (file: File) => {
    // Reset previous state
    setResult(null);
    setError(null);
    setIsLoading(true);

    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file type
      const allowedTypes = [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'audio/mpeg',
        'audio/mp4',
        'audio/wav',
        'audio/x-wav',
        'audio/webm',
        'video/webm',
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          `Unsupported file type: ${file.type}. Supported types: ${allowedTypes.join(', ')}`
        );
      }

      // Validate file size (50MB limit)
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxFileSize) {
        throw new Error(
          `File size exceeds limit. Maximum size: ${maxFileSize / (1024 * 1024)}MB`
        );
      }

      // Get backend URL
      const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.replace('/api', '') || 'http://localhost:8080';

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('media', file);

      // Upload and analyze
      const response = await fetch(`${backendUrl}/api/descript/upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        let errorText: string;
        let errorData: any = {};
        
        // Safely get response text
        try {
          errorText = await response.text();
        } catch (textError) {
          errorText = `Failed to read error response: ${textError}`;
        }
        
        // Handle 404 specifically
        if (response.status === 404) {
          const errorMessage = `Endpoint not found: /api/descript/upload. The backend server may need to be restarted, or the endpoint may not be available. Please check that the backend server is running and the route is registered.`;
          throw {
            message: errorMessage,
            code: 'ENDPOINT_NOT_FOUND',
            suggestion: 'Please restart the backend server or check that the route is properly registered.',
            isQuota: false,
          } as DescriptAnalysisError;
        }
        
        // Try to parse as JSON only if content-type indicates JSON
        if (isJson && errorText) {
          try {
            errorData = JSON.parse(errorText);
          } catch (parseError) {
            // If JSON parsing fails, check if it's HTML
            if (errorText.startsWith('<!DOCTYPE') || errorText.startsWith('<html')) {
              const errorMessage = `Server returned HTML (likely 404 page). The endpoint /api/descript/upload may not exist. Please check that the backend server is running and the route is registered.`;
              throw {
                message: errorMessage,
                code: 'ENDPOINT_NOT_FOUND',
                suggestion: 'Please restart the backend server or check that the route is properly registered.',
                isQuota: false,
              } as DescriptAnalysisError;
            }
            // Use error text as message if not HTML
            errorData = { error: errorText.substring(0, 200) };
          }
        } else if (errorText && !isJson) {
          // Handle HTML or plain text responses
          if (errorText.startsWith('<!DOCTYPE') || errorText.startsWith('<html')) {
            const errorMessage = `Server returned HTML (likely 404 page). The endpoint /api/descript/upload may not exist. Please check that the backend server is running and the route is registered.`;
            throw {
              message: errorMessage,
              code: 'ENDPOINT_NOT_FOUND',
              suggestion: 'Please restart the backend server or check that the route is properly registered.',
              isQuota: false,
            } as DescriptAnalysisError;
          }
          errorData = { error: errorText.substring(0, 200) };
        }
        
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        
        // Check error type - distinguish billing from usage limits
        const isBilling = errorData.errorType === 'billing_quota' || 
                         errorData.errorType === 'quota' ||
                         errorData.code === 'insufficient_quota' ||
                         errorMessage.toLowerCase().includes('billing') ||
                         errorMessage.toLowerCase().includes('credit') ||
                         errorMessage.toLowerCase().includes('payment');
        const isUsageLimit = errorData.errorType === 'usage_limit' ||
                            errorData.errorType === 'rate_limit' || 
                            errorData.errorType === 'rate_limit_tpd' ||
                            errorData.errorType === 'rate_limit_exceeded' ||
                            errorData.code === 'rate_limit_exceeded' ||
                            response.status === 429 ||
                            errorMessage.toLowerCase().includes('quota exceeded') ||
                            errorMessage.toLowerCase().includes('limit') ||
                            errorMessage.toLowerCase().includes('rate');
        
        // Only log non-billing/usage errors (these are handled in UI)
        if (!isBilling && !isUsageLimit) {
          console.error('Video analysis error:', response.status, response.statusText, errorData);
        } else if (isUsageLimit) {
          console.warn('⚠️ Usage limit (TPD/TPM/RPM) hit - will retry automatically');
        } else {
          console.warn('⚠️ Billing quota exceeded - error displayed in UI');
        }
        
        throw {
          message: errorMessage,
          code: errorData.code || errorData.errorType || `HTTP_${response.status}`,
          suggestion: errorData.suggestion,
          retryAfter: errorData.retryAfter,
          isQuota: isBilling,
          isRateLimit: isUsageLimit,
          errorType: errorData.errorType || (isBilling ? 'billing_quota' : 'usage_limit'),
        } as DescriptAnalysisError;
      }

      // Safely parse JSON response
      let data: any;
      try {
        const responseText = await response.text();
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        throw {
          message: 'Server returned invalid JSON response. Please check the backend server logs.',
          code: 'INVALID_RESPONSE',
          suggestion: 'Please check the backend server logs for errors.',
          isQuota: false,
        } as DescriptAnalysisError;
      }

      if (!data.success) {
        throw {
          message: data.error || 'Analysis failed',
          code: data.code,
          suggestion: data.suggestion,
        } as DescriptAnalysisError;
      }

      // Set result
      setResult({
        summary: data.data.summary || 'No summary available',
        highlights: data.data.highlights || [],
        transcript: data.data.transcript || 'No transcript available',
        segments: data.data.segments || [], // New: segments with timestamps and metadata
        duration: data.data.duration || 0, // Video duration in seconds
      });

    } catch (err: any) {
      // Only log non-quota errors (quota errors are handled in UI)
      const isQuotaError = err.isQuota || 
                          err.code === 'insufficient_quota' ||
                          err.message?.toLowerCase().includes('quota');
      
      if (!isQuotaError) {
        console.error('Video analysis error:', err);
      } else {
        console.warn('⚠️ Video analysis quota error - error displayed in UI');
      }
      
      // Handle different error types
      if (err.message) {
        setError({
          message: err.message,
          code: err.code,
          suggestion: err.suggestion,
          retryAfter: err.retryAfter,
          isQuota: err.isQuota || isQuotaError,
        });
      } else if (typeof err === 'string') {
        setError({ 
          message: err,
          isQuota: err.toLowerCase().includes('quota'),
        });
      } else {
        setError({
          message: 'Failed to analyze media file. Please try again.',
          code: 'UNKNOWN_ERROR',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    analyzeMedia,
    result,
    error,
    isLoading,
    reset,
  };
}


