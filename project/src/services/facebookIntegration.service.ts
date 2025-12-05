import { FacebookAuthResponse, FacebookPost, FacebookAccount } from '../types/facebook';
import { getFacebookConfig } from '../utils/facebookConfig';

class FacebookIntegrationService {
  private appId: string;
  private redirectUri: string;
  private accessToken: string | null = null;
  private userId: string | null = null;

  constructor() {
    try {
      const config = getFacebookConfig();
      this.appId = config.appId;
      // appSecret is retrieved for config validation but not stored client-side for security
    } catch (error) {
      console.error('Facebook configuration error:', error);
      this.appId = '';
    }
    
    this.redirectUri = `${window.location.origin}/facebook-callback`;
    
    // Check if we have stored tokens
    this.loadStoredTokens();
  }

  // Initialize Facebook SDK
  async initializeFacebookSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.FB) {
        resolve();
        return;
      }

      if (!this.appId) {
        reject(new Error('Facebook App ID is not configured'));
        return;
      }

      // Load Facebook SDK
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        try {
          window.FB.init({
            appId: this.appId,
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          });
          resolve();
        } catch (error) {
          reject(new Error(`Failed to initialize Facebook SDK: ${error instanceof Error ? error.message : String(error)}`));
        }
      };
      
      script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
      document.head.appendChild(script);
    });
  }

  // Get OAuth URL for manual authentication
  getOAuthUrl(): string {
    if (!this.appId) {
      throw new Error('Facebook App ID is not configured');
    }

    const scopes = [
      'email',
      'public_profile',
      'pages_manage_posts',
      'pages_read_engagement',
      'pages_show_list',
      'publish_to_groups',
      'user_posts'
    ].join(',');

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: scopes,
      response_type: 'code',
      state: 'facebook_auth'
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  // Get Facebook login status
  async getLoginStatus(): Promise<FacebookAuthResponse> {
    await this.initializeFacebookSDK();
    
    return new Promise((resolve) => {
      window.FB.getLoginStatus((response: FacebookAuthResponse) => {
        if (response.status === 'connected' && response.authResponse) {
          this.accessToken = response.authResponse.accessToken;
          this.userId = response.authResponse.userID;
          this.storeTokens();
        }
        resolve(response);
      });
    });
  }

  // Login to Facebook
  async loginToFacebook(): Promise<FacebookAuthResponse> {
    try {
      await this.initializeFacebookSDK();
      
      return new Promise((resolve, reject) => {
        console.log('🎯 Attempting Facebook login with enhanced scopes...');
        
        // Enhanced scopes for better functionality
        const scopes = [
          'email',
          'public_profile',
          'pages_manage_posts',
          'pages_read_engagement',
          'pages_show_list',
          'publish_to_groups',
          'user_posts'
        ].join(',');
        
        console.log('📋 Requesting scopes:', scopes);
        
        window.FB.login((response: FacebookAuthResponse) => {
          console.log('📱 Facebook login response:', response);
          
          if (response.status === 'connected' && response.authResponse) {
            this.accessToken = response.authResponse.accessToken;
            this.userId = response.authResponse.userID;
            this.storeTokens();
            console.log('✅ Facebook login successful!');
            console.log('👤 User ID:', this.userId);
            console.log('🔑 Access Token:', this.accessToken ? 'Received' : 'Missing');
            resolve(response);
          } else if (response.status === 'not_authorized') {
            console.error('❌ Facebook login not authorized');
            reject(new Error('Facebook login was not authorized. Please grant the required permissions.'));
          } else {
            console.error('❌ Facebook login failed with status:', response.status);
            reject(new Error(`Facebook login failed: ${response.status}. Please try again.`));
          }
        }, {
          scope: scopes,
          return_scopes: true,
          auth_type: 'rerequest' // Re-request permissions if previously denied
        });
      });
    } catch (error) {
      console.error('❌ Facebook login error:', error);
      if (error instanceof Error && error.message.includes('Facebook App ID is not configured')) {
        throw new Error('Facebook integration is not configured. Please check your environment variables.');
      }
      throw error;
    }
  }

  // Logout from Facebook
  async logoutFromFacebook(): Promise<void> {
    await this.initializeFacebookSDK();
    
    return new Promise((resolve) => {
      window.FB.logout(() => {
        this.accessToken = null;
        this.userId = null;
        this.clearStoredTokens();
        resolve();
      });
    });
  }

  // Get user's Facebook pages
  async getUserPages(): Promise<FacebookAccount[]> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${this.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch Facebook pages');
      }

      interface FacebookPageData {
        id: string;
        name: string;
        category?: string;
        access_token: string;
      }

      const data = await response.json();
      return (data.data as FacebookPageData[]).map((page: FacebookPageData) => ({
        id: page.id,
        name: page.name,
        category: page.category,
        accessToken: page.access_token,
        isPage: true
      }));
    } catch (error) {
      console.error('Error fetching Facebook pages:', error);
      throw error;
    }
  }

  // Get user's personal profile
  async getUserProfile(): Promise<FacebookAccount> {
    if (!this.accessToken || !this.userId) {
      throw new Error('No access token available');
    }

    try {
      console.log('📱 Fetching Facebook user profile...');
      
      // Enhanced fields for better profile information
      const fields = [
        'id',
        'name',
        'email',
        'picture',
        'first_name',
        'last_name',
        'gender',
        'birthday',
        'location'
      ].join(',');
      
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=${fields}&access_token=${this.accessToken}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch Facebook profile');
      }

      interface FacebookProfileResponse {
        id: string;
        name: string;
        email?: string;
        picture?: {
          data?: {
            url?: string;
          };
        };
      }

      const data = await response.json() as FacebookProfileResponse;
      console.log('✅ Facebook profile data received:', { id: data.id, name: data.name });
      
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        picture: data.picture?.data?.url,
        isPage: false,
        accessToken: this.accessToken || undefined
      };
    } catch (error) {
      console.error('❌ Error fetching Facebook profile:', error);
      throw error;
    }
  }

  // Check user permissions
  async checkUserPermissions(): Promise<string[]> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      console.log('🔐 Checking Facebook user permissions...');
      
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/permissions?access_token=${this.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch user permissions');
      }

      interface PermissionData {
        permission: string;
        status: string;
      }

      const data = await response.json();
      const grantedPermissions = (data.data as PermissionData[])
        .filter((permission: PermissionData) => permission.status === 'granted')
        .map((permission: PermissionData) => permission.permission);
      
      console.log('✅ Granted permissions:', grantedPermissions);
      return grantedPermissions;
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      throw error;
    }
  }

  // Upload post to Facebook (personal profile or page)
  async uploadPost(post: FacebookPost, targetId?: string): Promise<string> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const target = targetId || this.userId;
    if (!target) {
      throw new Error('No target ID available');
    }

    try {
      console.log('Attempting to upload post to Facebook:', { target, hasImage: !!post.image, hasLink: !!post.link });
      
      // For personal profiles, we can only post basic content
      // For pages, we need page access token
      let accessToken = this.accessToken;
      
      // If posting to a page, we need to get the page access token
      if (targetId && targetId !== this.userId) {
        const pages = await this.getUserPages();
        const targetPage = pages.find(page => page.id === targetId);
        if (targetPage && targetPage.accessToken) {
          accessToken = targetPage.accessToken;
          console.log('Using page access token for page:', targetPage.name);
        }
      }

      const formData = new FormData();
      formData.append('message', post.message);
      
      if (post.image) {
        formData.append('source', post.image);
      }
      
      if (post.link) {
        formData.append('link', post.link);
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${target}/feed?access_token=${accessToken}`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        interface ErrorResponse {
          error?: {
            message?: string;
          };
        }
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error?.message || 'Failed to upload post');
      }

      interface PostResponse {
        id: string;
      }
      const data = await response.json() as PostResponse;
      return data.id;
    } catch (error) {
      console.error('Error uploading post to Facebook:', error);
      throw error;
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

  // Exchange short-lived token for long-lived token
  async exchangeForLongLivedToken(shortLivedToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const appSecret = getFacebookConfig().appSecret;
      if (!appSecret) {
        throw new Error('Facebook App Secret is not configured');
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to exchange token');
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in || 5184000 // Default 60 days
      };
    } catch (error) {
      console.error('Error exchanging token:', error);
      throw error;
    }
  }

  // Get Instagram Business Account ID from Facebook Page
  async getInstagramBusinessAccount(pageId: string, pageAccessToken: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get Instagram Business Account');
      }

      const data = await response.json();
      return data.instagram_business_account?.id || null;
    } catch (error) {
      console.error('Error getting Instagram Business Account:', error);
      return null;
    }
  }

  // Enhanced login that exchanges for long-lived token and gets Instagram account
  async loginToFacebookWithLongLivedToken(): Promise<{
    authResponse: FacebookAuthResponse;
    longLivedToken?: string;
    expiresIn?: number;
    instagramBusinessAccountId?: string;
    pageId?: string;
  }> {
    try {
      // First, do regular login
      const authResponse = await this.loginToFacebook();
      
      if (authResponse.status !== 'connected' || !authResponse.authResponse) {
        return { authResponse };
      }

      const shortLivedToken = authResponse.authResponse.accessToken;
      
      // Exchange for long-lived token
      try {
        const longLivedData = await this.exchangeForLongLivedToken(shortLivedToken);
        
        // Store long-lived token
        this.accessToken = longLivedData.accessToken;
        this.storeTokens();

        // Get user's pages to find Instagram Business Account
        const pages = await this.getUserPages();
        let instagramAccountId: string | null = null;
        let pageId: string | undefined;

        // Try to find Instagram Business Account from first page
        if (pages.length > 0) {
          const firstPage = pages[0];
          pageId = firstPage.id;
          if (firstPage.accessToken) {
            instagramAccountId = await this.getInstagramBusinessAccount(firstPage.id, firstPage.accessToken);
          }
        }

        return {
          authResponse,
          longLivedToken: longLivedData.accessToken,
          expiresIn: longLivedData.expiresIn,
          instagramBusinessAccountId: instagramAccountId || undefined,
          pageId
        };
      } catch (exchangeError) {
        console.warn('Could not exchange for long-lived token, using short-lived token:', exchangeError);
        return { authResponse };
      }
    } catch (error) {
      console.error('Error in enhanced Facebook login:', error);
      throw error;
    }
  }

  // Store tokens in localStorage
  private storeTokens(): void {
    if (this.accessToken && this.userId) {
      localStorage.setItem('facebook_access_token', this.accessToken);
      localStorage.setItem('facebook_user_id', this.userId);
    }
  }

  // Load stored tokens from localStorage
  private loadStoredTokens(): void {
    const storedToken = localStorage.getItem('facebook_access_token');
    const storedUserId = localStorage.getItem('facebook_user_id');
    
    if (storedToken && storedUserId) {
      this.accessToken = storedToken;
      this.userId = storedUserId;
    }
  }

  // Clear stored tokens
  private clearStoredTokens(): void {
    localStorage.removeItem('facebook_access_token');
    localStorage.removeItem('facebook_user_id');
  }
}

// Export singleton instance
export const facebookIntegrationService = new FacebookIntegrationService();

interface FBInitParams {
  appId: string;
  cookie: boolean;
  xfbml: boolean;
  version: string;
}

interface FBLoginParams {
  scope?: string;
  return_scopes?: boolean;
  auth_type?: string;
}

// Global Facebook SDK types
declare global {
  interface Window {
    FB: {
      init: (params: FBInitParams) => void;
      login: (callback: (response: FacebookAuthResponse) => void, params?: FBLoginParams) => void;
      logout: (callback: () => void) => void;
      getLoginStatus: (callback: (response: FacebookAuthResponse) => void) => void;
    };
  }
}
