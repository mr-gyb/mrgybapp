import { InstagramAuthResponse, InstagramPost, InstagramAccount, InstagramPostResult } from '../types/instagram';

class InstagramIntegrationService {
  private accessToken: string | null = null;
  private userId: string | null = null;
  private redirectUri: string;

  constructor() {
    this.redirectUri = `${window.location.origin}/instagram-callback`;
    this.loadStoredTokens();
  }

  // Initialize Instagram Basic Display API
  async initializeInstagramAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Instagram Basic Display API doesn't require a separate SDK like Facebook
      // We'll use the OAuth 2.0 flow directly
      resolve();
    });
  }

  // Get Instagram login status
  async getLoginStatus(): Promise<InstagramAuthResponse> {
    await this.initializeInstagramAPI();
    
    if (this.accessToken && this.userId) {
      // Check if token is still valid
      try {
        const response = await fetch(
          `https://graph.instagram.com/me?fields=id,username&access_token=${this.accessToken}`
        );
        
        if (response.ok) {
          return { status: 'connected' };
        } else {
          // Token expired or invalid
          this.clearStoredTokens();
          return { status: 'not_authorized' };
        }
      } catch (error) {
        console.error('Error checking Instagram token:', error);
        this.clearStoredTokens();
        return { status: 'unknown' };
      }
    }
    
    return { status: 'not_authorized' };
  }

  // Login to Instagram
  async loginToInstagram(): Promise<InstagramAuthResponse> {
    await this.initializeInstagramAPI();
    
    // Instagram Basic Display API OAuth flow - using Facebook app credentials
    const clientId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!clientId) {
      throw new Error('Facebook App ID is not configured. Instagram integration uses the same app credentials as Facebook.');
    }

    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=user_profile,user_media&response_type=code`;
    
    // Open Instagram OAuth popup
    const popup = window.open(
      authUrl,
      'instagram-auth',
      'width=600,height=600,scrollbars=yes,resizable=yes'
    );

    return new Promise((resolve, reject) => {
      if (!popup) {
        reject(new Error('Failed to open Instagram login popup'));
        return;
      }

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Instagram login was cancelled'));
        }
      }, 1000);

      // Listen for message from popup
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'INSTAGRAM_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          popup.close();
          
          this.accessToken = event.data.accessToken;
          this.userId = event.data.userId;
          this.storeTokens();
          
          resolve({ status: 'connected' });
        } else if (event.data.type === 'INSTAGRAM_AUTH_ERROR') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          popup.close();
          reject(new Error(event.data.error || 'Instagram login failed'));
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }

  // Logout from Instagram
  async logoutFromInstagram(): Promise<void> {
    this.accessToken = null;
    this.userId = null;
    this.clearStoredTokens();
  }

  // Get user's Instagram profile
  async getUserProfile(): Promise<InstagramAccount> {
    if (!this.accessToken || !this.userId) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${this.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch Instagram profile');
      }

      const data = await response.json();
      return {
        id: data.id,
        username: data.username,
        fullName: data.username, // Instagram Basic Display API doesn't provide full name
        profilePicture: undefined, // Not available in Basic Display API
        isBusiness: data.account_type === 'BUSINESS',
        accessToken: this.accessToken
      };
    } catch (error) {
      console.error('Error fetching Instagram profile:', error);
      throw error;
    }
  }

  // Upload post to Instagram
  async uploadPost(post: InstagramPost): Promise<InstagramPostResult> {
    if (!this.accessToken || !this.userId) {
      throw new Error('No access token available');
    }

    try {
      // Instagram Basic Display API has limitations
      // We can only read data, not post directly
      // This would require Instagram Graph API (Business accounts only)
      
      if (post.mediaFiles && post.mediaFiles.length > 0) {
        // For now, we'll simulate the upload process
        // In a real implementation, you'd need Instagram Graph API access
        
        return {
          success: false,
          error: 'Instagram posting requires Instagram Graph API access (Business accounts only). Instagram Basic Display API only allows reading data.'
        };
      }

      return {
        success: false,
        error: 'Instagram Basic Display API does not support posting. Please upgrade to Instagram Graph API for posting capabilities.'
      };
    } catch (error) {
      console.error('Error uploading post to Instagram:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload post to Instagram'
      };
    }
  }

  // Check if user is connected
  isConnected(): boolean {
    return !!(this.accessToken && this.userId);
  }

  // Get current access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Get current user ID
  getUserId(): string | null {
    return this.userId;
  }

  // Store tokens in localStorage
  private storeTokens(): void {
    if (this.accessToken && this.userId) {
      localStorage.setItem('instagram_access_token', this.accessToken);
      localStorage.setItem('instagram_user_id', this.userId);
    }
  }

  // Load stored tokens from localStorage
  private loadStoredTokens(): void {
    const storedToken = localStorage.getItem('instagram_access_token');
    const storedUserId = localStorage.getItem('instagram_user_id');
    
    if (storedToken && storedUserId) {
      this.accessToken = storedToken;
      this.userId = storedUserId;
    }
  }

  // Clear stored tokens
  private clearStoredTokens(): void {
    localStorage.removeItem('instagram_access_token');
    localStorage.removeItem('instagram_user_id');
  }
}

// Export singleton instance
export const instagramIntegrationService = new InstagramIntegrationService();
