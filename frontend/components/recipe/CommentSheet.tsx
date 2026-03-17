import React, { useState, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Dynamic recipe service inclusion
import { recipeService } from '../../services/recipe.service';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  content: string;
  created_at: string;
  likes_count?: number;
  is_liked?: boolean;
}

interface CommentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  commentCount: number;
  recipeId?: string;
}

const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => (
  <div className="flex gap-3 mb-8">
    <div className="shrink-0">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-100">
        <img
          src={comment.user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + comment.user.username}
          className="w-full h-full object-cover"
          alt={comment.user.username}
        />
      </div>
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <h4 className="text-[14px] md:text-[15px] font-bold text-gray-900">@{comment.user.username}</h4>
        <span className="text-[11px] md:text-[12px] text-gray-400">
          {comment.created_at ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) : 'just now'}
        </span>
      </div>
      <p className="text-[13px] md:text-[14px] text-gray-800 leading-relaxed">
        {comment.content}
      </p>
      <div className="flex items-center gap-5 mt-2">
        <button className="flex items-center gap-1.5 active:scale-90 transition-transform">
          <span className={`text-sm transition-all ${comment.is_liked ? 'grayscale-0 scale-110' : 'grayscale opacity-70 scale-100'}`}>
            😋
          </span>
          <span className="text-[12px] font-semibold text-gray-500">{comment.likes_count || 0}</span>
        </button>
        <button className="text-[11px] font-bold text-gray-400 uppercase tracking-widest active:opacity-60">
          REPLY
        </button>
      </div>
    </div>
  </div>
);

const CommentSheet: React.FC<CommentSheetProps> = ({ isOpen, onClose, commentCount, recipeId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && recipeId) {
      fetchComments();
    }
  }, [isOpen, recipeId]);

  const fetchComments = async () => {
    if (!recipeId) return;
    setIsLoading(true);
    try {
      const response = await recipeService.getComments(recipeId);
      setComments(response);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || !recipeId) return;
    setIsSubmitting(true);
    try {
      await recipeService.addComment(recipeId, newComment);
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Comment Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full md:max-w-2xl bg-white rounded-t-[40px] md:rounded-[40px] flex flex-col h-[85vh] md:h-[70vh] shadow-2xl overflow-hidden mx-auto"
          >
            {/* Handle Bar (Mobile Only) */}
            <div className="w-full flex justify-center py-3 md:hidden">
              <div className="w-12 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 pt-2 md:pt-6 flex items-center justify-between border-b border-gray-50">
              <div className="w-10" /> {/* Balancer */}
              <h2 className="text-lg md:text-xl font-black text-[#E85D1A] tracking-tight uppercase">
                {commentCount} Comments
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 active:scale-90 transition-all"
              >
                <X size={26} strokeWidth={2} />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-6 py-8 hide-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading debate...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4 text-gray-400">
                  <p className="text-lg font-bold">No comments yet</p>
                  <p className="text-sm">Be the first to share your thoughts!</p>
                </div>
              ) : (
                comments.map(comment => (
                  <CommentItem key={comment.id} comment={comment} />
                ))
              )}
              <div className="h-10" />
            </div>

            {/* Footer Input */}
            <div className="p-4 md:p-6 bg-white border-t border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0 border border-gray-200 overflow-hidden">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=User"
                  className="w-full h-full object-cover"
                  alt="My Avatar"
                />
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Add a comment..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-full py-3.5 pl-6 pr-14 text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || isSubmitting}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-40 disabled:grayscale"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} className="ml-0.5" fill="currentColor" />
                  )}
                </button>
              </div>
            </div>

            {/* Desktop Close Indicator Padding */}
            <div className="md:h-2" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommentSheet;
