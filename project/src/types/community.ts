/**
 * Community Post and Comment Types
 *
 * Data model matches Firestore structure:
 * - posts collection with documents matching Post interface
 * - posts/{postId}/comments subcollection with documents matching Comment interface
 */

export type PostAudience = 'anyone' | 'friends';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  authorPhotoURL?: string;
  text: string;
  imageURL?: string;
  /**
   * Preferred audience targeting for the post.
   */
  audience: PostAudience;
  /**
   * Legacy field maintained for backward compatibility with older clients.
   * When present it mirrors the {@link Post.audience} value.
   */
  visibility?: PostAudience;
  likeCount: number;
  likedBy: string[];
  commentsCount: number;
  repostCount?: number;
  shareCount?: number;
  isAI?: boolean;
  createdAt: Date | null;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  authorPhotoURL?: string;
  text: string;
  createdAt: Date | null;
}
