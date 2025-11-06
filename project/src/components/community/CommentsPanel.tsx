import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { watchComments, addComment } from '../../services/posts';
import { Comment } from '../../types/community';
import { formatTimeAgo } from '../../utils/formatTime';
import { Send } from 'lucide-react';

interface CommentsPanelProps {
  postId: string;
  initialCount?: number;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ postId, initialCount = 0 }) => {
  const { user, userData } = useAuth();
  const { showError } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  useEffect(() => {
    const unsubscribe = watchComments(postId, (fetchedComments) => {
      setComments(fetchedComments);
    });
    return () => unsubscribe();
  }, [postId]);

  const handleAddComment = async () => {
    if (!user || !userData) {
      showError('You must be logged in to comment.');
      return;
    }
    if (!newCommentText.trim()) {
      showError('Comment cannot be empty.');
      return;
    }

    setIsAddingComment(true);
    try {
      await addComment(
        postId,
        { text: newCommentText.trim() },
        { uid: user.uid, displayName: userData.name || 'Anonymous' }
      );
      setNewCommentText('');
    } catch (error: unknown) {
      console.error('Error adding comment:', error);
      showError(error instanceof Error ? error.message : 'Failed to add comment.');
    } finally {
      setIsAddingComment(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mt-3">
      <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Comments ({comments.length})</h4>
      
      {/* Comment List */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2">
              <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.authorName}`} 
                alt={comment.authorName} 
                className="w-7 h-7 rounded-full object-cover flex-shrink-0" 
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{comment.authorName}</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{comment.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {comment.createdAt ? formatTimeAgo(comment.createdAt) : 'Just now'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input */}
      <div className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-600 pt-3">
        <textarea
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          placeholder="Add a comment..."
          rows={1}
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          disabled={isAddingComment}
        />
        <button
          onClick={handleAddComment}
          disabled={isAddingComment || !newCommentText.trim()}
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center"
        >
          {isAddingComment ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

export default CommentsPanel;

