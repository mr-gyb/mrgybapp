export interface InstagramAuthResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    userID: string;
    expiresIn: number;
    signedRequest: string;
  };
}

export interface InstagramAccount {
  id: string;
  username: string;
  fullName: string;
  profilePicture?: string;
  isBusiness: boolean;
  accessToken: string;
}

export interface InstagramPost {
  caption: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaFiles?: File[];
  location?: string;
  hashtags?: string[];
  mentions?: string[];
}

export interface InstagramIntegrationStatus {
  isConnected: boolean;
  account?: InstagramAccount;
  permissions: string[];
}

export interface InstagramPostResult {
  success: boolean;
  postId?: string;
  error?: string;
  mediaIds?: string[];
}
