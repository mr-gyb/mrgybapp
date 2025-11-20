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
    this.redirectUri = `${window.location.origin}/settings/integrations/callback`;
  }

  /**
   * Get the OAuth authorization URL
   */
  getAuthUrl(): string {
    const scope = encodeURIComponent(
      'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly'
    );
    const state = this.generateState();
    sessionStorage.setItem('youtube_oauth_state', state);
    
    return `https://accounts.google.com/o/oauth2/v2/auth?` +
      `response_type=code&` +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `scope=${scope}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('YouTube OAuth credentials not configured. Please set VITE_YOUTUBE_CLIENT_ID and VITE_YOUTUBE_CLIENT_SECRET in your .env file.');
    }

    try {
      // For client-side OAuth, we need to use a backend proxy or handle it differently
      // Since we don't have a backend, we'll use a workaround with Google's token endpoint
      // Note: This requires CORS to be enabled or a backend proxy
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Token exchange failed: ${response.status} ${errorData}`);
      }

      const tokenData: TokenResponse = await response.json();
      this.saveToken(tokenData);
      return tokenData;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      // If direct call fails (CORS issue), provide instructions for backend setup
      throw new Error(
        'Token exchange requires a backend server. Please set up a backend endpoint to exchange the authorization code for an access token, or use the manual token method.'
      );
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
   * Get stored access token
   */
  getAccessToken(): string | null {
    // Check if token is expired
    const expiryTime = localStorage.getItem(this.tokenExpiryKey);
    if (expiryTime && Date.now() > parseInt(expiryTime)) {
      // Token expired, try to refresh
      this.refreshToken();
      return null;
    }

    return localStorage.getItem(this.tokenStorageKey);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem(this.refreshTokenStorageKey);
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
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
   * Manually set access token (for users who get it from Google Cloud Console)
   */
  setAccessTokenManually(token: string): void {
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
    const token = this.getAccessToken();
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

