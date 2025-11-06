/**
 * Community Post and Comment Types
 * 
 * Data model matches Firestore structure:
 * - posts collection with documents matching Post interface
 * - posts/{postId}/comments subcollection with documents matching Comment interface
 */

import { Timestamp } from 'firebase/firestore';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  text: string;
  imageURL?: string;
  visibility: 'anyone' | 'friends';
  likeCount: number;
  likedBy: string[]; // userIds who liked this post
  commentsCount: number;
  repostCount?: number; // Number of reposts (default 0)
  shareCount?: number; // Number of shares (default 0)
  isAI?: boolean; // Whether post is AI-generated (optional)
  createdAt: Date | null; // from server Timestamp
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  text: string;
  createdAt: Date | null; // from server Timestamp
}
