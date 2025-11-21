import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Repeat2, Share2, MoreVertical } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { toggleLike, watchComments, addComment, repostPost, sharePost, deletePost } from '../../services/posts';
import { Post, Comment } from '../../types/community';
import { useRelativeTime } from '../../hooks/useRelativeTime';
import { formatContentWithLinks } from '../../utils/formatContent';
import CommunityAvatar from './CommunityAvatar';

interface PostCardProps {
  post: Post;
  currentUserId: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId }) => {
  const { showError, showSuccess } = useToast();
  const { user: authUser } = useAuth();
  const [liked, setLiked] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(post.likeCount || 0);
  const [currentRepostCount, setCurrentRepostCount] = useState(post.repostCount || 0);
  const [currentShareCount, setCurrentShareCount] = useState(post.shareCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const relativeTime = useRelativeTime(post.createdAt);
  const isOwnPost = post.authorId === currentUserId;

  // Check if user has liked (from likedBy array)
  useEffect(() => {
    if (currentUserId && post.likedBy) {
      setLiked(post.likedBy.includes(currentUserId));
      setCurrentLikeCount(post.likeCount || 0);
    }
  }, [post.likedBy, post.likeCount, currentUserId]);

  // Watch comments
  useEffect(() => {
    const unsubscribe = watchComments(post.id, (fetchedComments) => {
      setComments(fetchedComments);
    });
    return () => unsubscribe();
  }, [post.id]);

  const handleLikeToggle = async () => {
    if (!currentUserId || isLiking) {
      if (!currentUserId) {
        showError('Please sign in to like posts');
      }
      return;
    }

    setIsLiking(true);
    const previousLiked = liked;
    const previousCount = currentLikeCount;

    // Optimistic update
    if (liked) {
      setLiked(false);
      setCurrentLikeCount(prev => Math.max(0, prev - 1));
    } else {
      setLiked(true);
      setCurrentLikeCount(prev => prev + 1);
    }

    try {
      await toggleLike(post.id, currentUserId);
    } catch (error: unknown) {
      console.error('Error toggling like:', error);
      showError(error instanceof Error ? error.message : 'Failed to toggle like.');
      // Revert optimistic UI on error
      setLiked(previousLiked);
      setCurrentLikeCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleRepost = async () => {
    if (!currentUserId || isReposting) {
      if (!currentUserId) {
        showError('Please sign in to repost');
      }
      return;
    }

    setIsReposting(true);
    const previousCount = currentRepostCount;

    // Optimistic update
    setCurrentRepostCount(prev => prev + 1);

    try {
      await repostPost(post.id, currentUserId);
      showSuccess('Post reposted!');
    } catch (error: unknown) {
      console.error('Error reposting:', error);
      showError(error instanceof Error ? error.message : 'Failed to repost.');
      // Revert optimistic UI on error
      setCurrentRepostCount(previousCount);
    } finally {
      setIsReposting(false);
    }
  };

  const handleShare = async () => {
    if (!currentUserId || isSharing) {
      if (!currentUserId) {
        showError('Please sign in to share posts');
      }
      return;
    }

    setIsSharing(true);
    const previousCount = currentShareCount;

    // Optimistic update
    setCurrentShareCount(prev => prev + 1);

    try {
      await sharePost(post.id, currentUserId);
      
      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${post.authorName}`,
          text: post.text,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        showSuccess('Link copied to clipboard!');
      }
    } catch (error: unknown) {
      // If user cancels share, don't show error
      if (error instanceof Error && error.name === 'AbortError') {
        setCurrentShareCount(previousCount);
        return;
      }
      console.error('Error sharing:', error);
      showError(error instanceof Error ? error.message : 'Failed to share.');
      // Revert optimistic UI on error
      setCurrentShareCount(previousCount);
    } finally {
      setIsSharing(false);
    }
  };

  const handleAddComment = async () => {
    if (!authUser?.uid || !newCommentText.trim() || isAddingComment) {
      return;
    }

    setIsAddingComment(true);
    try {
      await addComment(
        post.id,
        { text: newCommentText.trim() },
        {
          uid: authUser.uid,
          displayName: authUser.displayName || authUser.email || 'Anonymous',
          photoURL: authUser.photoURL || undefined,
          email: authUser.email
        }
      );
      setNewCommentText('');
      showSuccess('Comment added!');
    } catch (error: unknown) {
      console.error('Error adding comment:', error);
      showError(error instanceof Error ? error.message : 'Failed to add comment.');
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!currentUserId || !isOwnPost || isDeleting) {
      return;
    }

    // Confirm deletion
    const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
    if (!confirmed) {
      setShowMenu(false);
      return;
    }

    setIsDeleting(true);
    try {
      await deletePost(post.id, currentUserId);
      showSuccess('Post deleted successfully');
      // The post will be removed from the feed via real-time listener
    } catch (error: unknown) {
      console.error('Error deleting post:', error);
      showError(error instanceof Error ? error.message : 'Failed to delete post.');
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const displayedComments = showAllComments ? comments : comments.slice(-2);
  const hasMoreComments = comments.length > 2;

  return (
    <article 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 p-5"
      style={{ marginBottom: '16px' }}
    >
      {/* Post Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <CommunityAvatar
            name={post.authorName}
            email={post.authorEmail}
            photoURL={post.authorPhotoURL}
            size={40}
            className="flex-shrink-0"
          />

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {post.authorName}
              </h3>
              {/* AI Pill (optional) */}
              {post.isAI && (
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                  AI
                </span>
              )}
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {relativeTime}
              </span>
            </div>
          </div>
        </div>

        {/* Three-dot Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="More options"
            aria-expanded={showMenu}
          >
            <MoreVertical size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-0"
                onClick={() => setShowMenu(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                {isOwnPost && (
                  <button
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                )}
                {!isOwnPost && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      // TODO: Implement report
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Report
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Post Text */}
      <div className="mb-3 text-gray-900 dark:text-gray-100 text-sm leading-relaxed">
        <div dangerouslySetInnerHTML={{ __html: formatContentWithLinks(post.text) }} />
      </div>

      {/* Post Image - 16:9 aspect ratio, max-height 240px, 12px radius */}
      {post.imageURL && (
        <div className="mb-3 rounded-xl overflow-hidden" style={{ borderRadius: '12px' }}>
          <div className="w-full" style={{ maxHeight: '240px', aspectRatio: '16/9', overflow: 'hidden' }}>
            <img
              src={post.imageURL}
              alt="Post content"
              className="w-full h-full object-cover"
              style={{ objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        {/* Like */}
        <button
          onClick={handleLikeToggle}
          disabled={isLiking || !currentUserId}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
            liked
              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={liked ? 'Unlike post' : 'Like post'}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          <span className="text-sm font-medium">{currentLikeCount}</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => {
            if (!currentUserId) {
              showError('Please sign in to view comments');
              return;
            }
            setShowComments(!showComments);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!currentUserId}
        >
          <MessageCircle size={18} />
          <span className="text-sm font-medium">{post.commentsCount || 0}</span>
        </button>

        {/* Repost */}
        <button
          onClick={handleRepost}
          disabled={isReposting || !currentUserId}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Repost"
        >
          <Repeat2 size={18} />
          <span className="text-sm font-medium">{currentRepostCount}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          disabled={isSharing || !currentUserId}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Share"
        >
          <Share2 size={18} />
          <span className="text-sm font-medium">{currentShareCount}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {/* Comments List */}
          {displayedComments.length > 0 && (
            <div className="space-y-3 mb-3">
              {displayedComments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <CommunityAvatar
                    name={comment.authorName}
                    email={comment.authorEmail}
                    photoURL={comment.authorPhotoURL}
                    size={32}
                    className="flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {comment.authorName}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Comments Link */}
          {hasMoreComments && !showAllComments && (
            <button
              onClick={() => setShowAllComments(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-3"
            >
              View all comments ({comments.length})
            </button>
          )}

          {/* Add Comment Input */}
          {currentUserId && (
            <div className="flex gap-2">
              <textarea
                className="flex-1 p-2.5 border border-gray-200 dark:border-gray-600 resize-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white rounded-lg"
                placeholder="Add a comment..."
                rows={1}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                disabled={isAddingComment}
                style={{ fontSize: '14px' }}
              />
              <button
                onClick={handleAddComment}
                disabled={isAddingComment || !newCommentText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center"
              >
                {isAddingComment ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Post'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default PostCard;
