export interface FacebookAuthResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    userID: string;
    expiresIn: number;
    signedRequest: string;
    graphDomain: string;
  };
}

export interface FacebookAccount {
  id: string;
  name: string;
  email?: string;
  picture?: string;
  category?: string;
  accessToken?: string;
  isPage: boolean;
}

export interface FacebookPost {
  message: string;
  image?: File | string;
  link?: string;
  scheduledTime?: Date;
  privacy?: 'EVERYONE' | 'ALL_FRIENDS' | 'FRIENDS_OF_FRIENDS' | 'SELF';
}

export interface FacebookIntegrationStatus {
  isConnected: boolean;
  userProfile?: FacebookAccount;
  pages: FacebookAccount[];
  permissions: string[];
  lastSync?: Date;
}

export interface FacebookPostResult {
  success: boolean;
  postId?: string;
  error?: string;
  url?: string;
}
