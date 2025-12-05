/**
 * YouTube OAuth Service
 * Handles OAuth 2.0 authentication flow for YouTube Analytics API
 */

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

class YouTubeOAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private tokenStorageKey = 'youtube_oauth_token';
  private refreshTokenStorageKey = 'youtube_refresh_token';
  private tokenExpiryKey = 'youtube_token_expiry';

  constructor() {
    // Use provided client ID or fallback to env variable
    this.clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID || '956684071028-3vm17a0fknfnrvcmrm3baolgtqai1f8l.apps.googleusercontent.com';
    this.clientSecret = import.meta.env.VITE_YOUTUBE_CLIENT_SECRET || '';
    // Use explicit redirect URI from env or default to localhost:3002
    this.redirectUri = import.meta.env.VITE_YOUTUBE_REDIRECT_URI || 
                      (import.meta.env.DEV ? 'http://localhost:3002/settings/integrations/callback' : 
                       `${window.location.origin}/settings/integrations/callback`);
  }

  /**
   * Get the OAuth authorization URL from backend
   */
  async getAuthUrl(): Promise<string> {
    const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.replace('/api', '') || 'http://localhost:8080';
    
    try {
      const response = await fetch(`${backendUrl}/api/youtube/auth-url`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, try to get text
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          } catch (textError) {
            // Keep the default error message
          }
        }
        
        // Provide specific error messages
        if (response.status === 500) {
          errorMessage = 'Backend server error. Please ensure the backend is running and YouTube OAuth credentials are configured.';
        } else if (response.status === 404) {
          errorMessage = 'OAuth endpoint not found. Please check backend configuration.';
        } else if (response.status === 0 || errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          errorMessage = `Cannot connect to backend server at ${backendUrl}. Please ensure the backend is running on port 8080.`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.authUrl) {
        throw new Error('Backend did not return an OAuth URL. Please check backend configuration.');
      }
      
      const state = this.generateState();
      sessionStorage.setItem('youtube_oauth_state', state);
      
      // Append state to the auth URL for CSRF protection
      const separator = data.authUrl.includes('?') ? '&' : '?';
      return `${data.authUrl}${separator}state=${state}`;
    } catch (error: any) {
      console.error('Error getting OAuth URL:', error);
      
      // Provide more helpful error messages
      if (error.message) {
        throw error;
      } else if (error.name === 'TypeError' && error.message?.includes('fetch')) {
        throw new Error(`Cannot connect to backend server at ${backendUrl}. Please ensure the backend is running on port 8080.`);
      } else {
        throw new Error(error.message || 'Failed to get OAuth URL. Please check backend configuration and ensure YouTube OAuth credentials are set.');
      }
    }
  }

  /**
   * Exchange authorization code for access token via backend
   */
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    try {
      const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.replace('/api', '') || 'http://localhost:8080';
      
      const response = await fetch(`${backendUrl}/api/youtube/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirectUri: this.redirectUri,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Token exchange failed: ${response.status}`);
      }

      const tokenData: TokenResponse = await response.json();
      this.saveToken(tokenData);
      return tokenData;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  /**
   * Save access token to localStorage
   */
  private saveToken(tokenData: TokenResponse): void {
    const expiryTime = Date.now() + (tokenData.expires_in * 1000);
    
    localStorage.setItem(this.tokenStorageKey, tokenData.access_token);
    localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
    
    if (tokenData.refresh_token) {
      localStorage.setItem(this.refreshTokenStorageKey, tokenData.refresh_token);
    }

    // Also set it as environment variable format for the service
    // Note: This is a workaround - in production, use a secure backend
    if (typeof window !== 'undefined') {
      (window as any).__YOUTUBE_ACCESS_TOKEN__ = tokenData.access_token;
    }
  }

  /**
   * Get stored access token (auto-refreshes if expired)
   */
  async getAccessToken(): Promise<string | null> {
    // Check if token is expired
    const expiryTime = localStorage.getItem(this.tokenExpiryKey);
    if (expiryTime && Date.now() > parseInt(expiryTime)) {
      // Token expired, try to refresh
      const refreshed = await this.refreshToken();
      return refreshed;
    }

    return localStorage.getItem(this.tokenStorageKey);
  }

  /**
   * Get stored access token synchronously (for immediate use, may be expired)
   */
  getAccessTokenSync(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  /**
   * Refresh access token using refresh token via backend
   */
  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem(this.refreshTokenStorageKey);
    if (!refreshToken) {
      return null;
    }

    try {
      const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.replace('/api', '') || 'http://localhost:8080';
      
      const response = await fetch(`${backendUrl}/api/youtube/oauth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokenData: TokenResponse = await response.json();
      this.saveToken(tokenData);
      return tokenData.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear invalid tokens
      this.clearTokens();
      return null;
    }
  }

  /**
   * Manually set access token (DEPRECATED - use OAuth flow instead)
   * @deprecated Use the OAuth flow instead of manual token entry
   */
  setAccessTokenManually(token: string): void {
    console.warn('Manual token entry is deprecated. Please use the OAuth flow.');
    localStorage.setItem(this.tokenStorageKey, token);
    // Set expiry to 1 hour from now (default Google token expiry)
    const expiryTime = Date.now() + (3600 * 1000);
    localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
    
    if (typeof window !== 'undefined') {
      (window as any).__YOUTUBE_ACCESS_TOKEN__ = token;
    }
  }

  /**
   * Clear stored tokens
   */
  clearTokens(): void {
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.refreshTokenStorageKey);
    localStorage.removeItem(this.tokenExpiryKey);
    
    if (typeof window !== 'undefined') {
      delete (window as any).__YOUTUBE_ACCESS_TOKEN__;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessTokenSync();
    return !!token;
  }

  /**
   * Generate random state for OAuth security
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Verify OAuth state
   */
  verifyState(state: string): boolean {
    const storedState = sessionStorage.getItem('youtube_oauth_state');
    sessionStorage.removeItem('youtube_oauth_state');
    return storedState === state;
  }
}

export const youtubeOAuthService = new YouTubeOAuthService();
export default youtubeOAuthService;


