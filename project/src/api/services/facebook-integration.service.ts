import axios from 'axios';
import { auth } from '../../lib/firebase';

export interface FacebookAccount {
  id: string;
  name: string;
  accessToken: string;
  permissions: string[];
  isConnected: boolean;
  connectedAt: string;
}

export interface FacebookPostData {
  message: string;
  link?: string;
  imageUrl?: string;
  scheduledTime?: string;
  pageId?: string;
}

export interface FacebookPostResult {
  success: boolean;
  postId?: string;
  error?: string;
  url?: string;
}

export class FacebookIntegrationService {
  private static instance: FacebookIntegrationService;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  public static getInstance(): FacebookIntegrationService {
    if (!FacebookIntegrationService.instance) {
      FacebookIntegrationService.instance = new FacebookIntegrationService();
    }
    return FacebookIntegrationService.instance;
  }

  /**
   * Connect user's Facebook account
   */
  async connectFacebookAccount(accessToken: string): Promise<FacebookAccount> {
    try {
      // Verify the access token and get user info
      const userResponse = await axios.get(`${this.baseUrl}/me`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,email'
        }
      });

      // Get user's pages
      const pagesResponse = await axios.get(`${this.baseUrl}/me/accounts`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,access_token,permissions'
        }
      });

      const user = userResponse.data;
      const pages = pagesResponse.data.data || [];

      // Store the connection in Firebase
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // For now, we'll use the first page if available, or the user's personal account
      const primaryAccount = pages.length > 0 ? pages[0] : {
        id: user.id,
        name: user.name,
        access_token: accessToken,
        permissions: ['publish_actions', 'publish_pages']
      };

      const facebookAccount: FacebookAccount = {
        id: primaryAccount.id,
        name: primaryAccount.name,
        accessToken: primaryAccount.access_token,
        permissions: primaryAccount.permissions || [],
        isConnected: true,
        connectedAt: new Date().toISOString()
      };

      // Store in localStorage for now (in production, this should go to Firebase)
      localStorage.setItem(`facebook_account_${currentUser.uid}`, JSON.stringify(facebookAccount));

      return facebookAccount;
    } catch (error) {
      console.error('Error connecting Facebook account:', error);
      throw new Error('Failed to connect Facebook account');
    }
  }

  /**
   * Disconnect user's Facebook account
   */
  async disconnectFacebookAccount(): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Remove from localStorage
      localStorage.removeItem(`facebook_account_${currentUser.uid}`);
      
      return true;
    } catch (error) {
      console.error('Error disconnecting Facebook account:', error);
      return false;
    }
  }

  /**
   * Get connected Facebook account
   */
  async getConnectedAccount(): Promise<FacebookAccount | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return null;
      }

      const stored = localStorage.getItem(`facebook_account_${currentUser.uid}`);
      if (!stored) {
        return null;
      }

      return JSON.parse(stored) as FacebookAccount;
    } catch (error) {
      console.error('Error getting connected Facebook account:', error);
      return null;
    }
  }

  /**
   * Upload post to Facebook
   */
  async uploadPost(postData: FacebookPostData): Promise<FacebookPostResult> {
    try {
      const account = await this.getConnectedAccount();
      if (!account) {
        throw new Error('No Facebook account connected');
      }

      if (!account.permissions.includes('publish_actions') && !account.permissions.includes('publish_pages')) {
        throw new Error('Insufficient permissions to post to Facebook');
      }

      interface PostParams {
        message: string;
        access_token: string;
        link?: string;
      }

      const postParams: PostParams = {
        message: postData.message,
        access_token: account.accessToken
      };

      if (postData.link) {
        postParams.link = postData.link;
      }

      if (postData.imageUrl) {
        // If posting to a page, use the page's access token
        const targetId = postData.pageId || account.id;
        const targetToken = postData.pageId ? account.accessToken : account.accessToken;
        
        // Upload image first if provided
        if (postData.imageUrl) {
          const imageResponse = await axios.post(`${this.baseUrl}/${targetId}/photos`, {
            url: postData.imageUrl,
            access_token: targetToken
          });
          
          if (imageResponse.data.id) {
            postParams.attached_media = `{"media_fbid":"${imageResponse.data.id}"}`;
          }
        }
      }

      // Post to Facebook
      const response = await axios.post(`${this.baseUrl}/${account.id}/feed`, postParams);

      if (response.data.id) {
        return {
          success: true,
          postId: response.data.id,
          url: `https://www.facebook.com/${response.data.id}`
        };
      } else {
        throw new Error('Failed to get post ID from Facebook');
      }
    } catch (error) {
      console.error('Error uploading post to Facebook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get user's Facebook pages
   */
  async getUserPages(accessToken: string): Promise<Array<{ id: string; name: string; access_token: string }>> {
    try {
      const response = await axios.get(`${this.baseUrl}/me/accounts`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,access_token'
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error getting user pages:', error);
      return [];
    }
  }

  /**
   * Check if user has sufficient permissions
   */
  async checkPermissions(accessToken: string): Promise<{ canPost: boolean; permissions: string[] }> {
    try {
      const response = await axios.get(`${this.baseUrl}/me/permissions`, {
        params: {
          access_token: accessToken
        }
      });

      interface Permission {
        permission: string;
        status: string;
      }

      const permissions: Permission[] = response.data.data || [];
      const canPost = permissions.some((perm: Permission) => 
        perm.permission === 'publish_actions' && perm.status === 'granted'
      ) || permissions.some((perm: Permission) => 
        perm.permission === 'publish_pages' && perm.status === 'granted'
      );

      return {
        canPost,
        permissions: permissions.map((perm: Permission) => perm.permission)
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return { canPost: false, permissions: [] };
    }
  }
}

export const facebookIntegrationService = FacebookIntegrationService.getInstance();
