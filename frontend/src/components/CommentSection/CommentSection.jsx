import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Trash2, Send, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';

const CommentSection = ({ blogId, blogAuthorId }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/blogs/${blogId}/comments`);
      if (response.data?.success) {
        setComments(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (blogId) {
      fetchComments();
    }
  }, [blogId]);

  const handleUnauthenticatedClick = () => {
    showToast('Authentication required: Please sign in to post comments.', 'info');
    navigate('/login', { state: { from: location } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      handleUnauthenticatedClick();
      return;
    }

    if (!content || !content.trim()) {
      showToast('Please type a comment before submitting.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await API.post(`/blogs/${blogId}/comments`, {
        content: content.trim(),
      });

      if (response.data?.success) {
        setComments([response.data.data, ...comments]);
        setContent('');
        showToast('Comment published successfully.', 'success');
      }
    } catch (error) {
      showToast(error.message || 'Failed to post comment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!isAuthenticated) {
      handleUnauthenticatedClick();
      return;
    }

    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    setDeletingId(commentId);
    try {
      const response = await API.delete(`/comments/${commentId}`);
      if (response.data?.success) {
        setComments(comments.filter((c) => c._id !== commentId));
        showToast('Comment deleted.', 'success');
      }
    } catch (error) {
      showToast(error.message || 'Failed to delete comment.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section id="comments" className="space-y-8 pt-10 border-t border-gray-200 scroll-mt-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
          <MessageSquare className="w-6 h-6 text-emerald-600" />
          <span>Comments ({comments.length})</span>
        </h3>
      </div>

      {/* Comment Input Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start space-x-3">
            {user?.profileImage?.url ? (
              <img
                src={user.profileImage.url}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0 mt-1"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 shrink-0 mt-1">
                <i className="fa-solid fa-user text-sm"></i>
              </div>
            )}
            <div className="flex-1 space-y-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                maxLength={1000}
                className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-emerald-600 transition-all resize-none card-shadow"
              />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{1000 - content.length} characters remaining</span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm transition-all shadow-sm flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Posting...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Post Comment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Login Required Box */
        <div
          onClick={handleUnauthenticatedClick}
          className="p-6 bg-white border border-gray-200 rounded-2xl text-center space-y-3 card-shadow cursor-pointer hover:border-emerald-400 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-gray-900">Sign in to join the discussion</h4>
          <p className="text-gray-600 text-xs max-w-sm mx-auto">
            You must be logged in with a PayUBlog account to like posts and leave comments.
          </p>
          <button
            type="button"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Sign In to Comment
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 pt-2">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="p-4 bg-white rounded-2xl animate-pulse space-y-2 border border-gray-200">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-3/4 bg-gray-200/70 rounded"></div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-sm italic py-4">
            No comments yet. Be the first to post a comment!
          </p>
        ) : (
          comments.map((comment) => {
            const isCommentAuthor = user && comment.user?._id === user.id;
            const isBlogAuthorUser = user && blogAuthorId === user.id;
            const canDelete = isCommentAuthor || isBlogAuthorUser || user?.role === 'admin';

            return (
              <div
                key={comment._id}
                className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3 card-shadow"
              >
                <div className="flex items-center justify-between">
                  <Link
                    to={`/author/${comment.user?.username}`}
                    className="flex items-center space-x-3 group"
                  >
                    {comment.user?.profileImage?.url ? (
                      <img
                        src={comment.user.profileImage.url}
                        alt={comment.user?.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 text-xs">
                        <i className="fa-solid fa-user"></i>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {comment.user?.name || 'User'}
                      </span>
                      {comment.user?._id === blogAuthorId && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 rounded-full">
                          Author
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="flex items-center space-x-3 text-xs text-gray-400">
                    <span>
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        disabled={deletingId === comment._id}
                        className="text-gray-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title={isBlogAuthorUser ? 'Delete comment' : 'Delete your comment'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed pl-11">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default CommentSection;
