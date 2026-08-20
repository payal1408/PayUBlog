import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';

const LikeButton = ({ blogId, initialIsLiked = false, initialLikesCount = 0, size = 'normal' }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Synchronize state when props update from async API responses
  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  useEffect(() => {
    setLikesCount(initialLikesCount);
  }, [initialLikesCount]);

  const handleLikeToggle = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      showToast('Please log in to like this blog post.', 'info');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (loading || !blogId) return;
    setLoading(true);

    const previousIsLiked = isLiked;
    const previousCount = likesCount;

    // Optimistic UI update
    const newLikedState = !previousIsLiked;
    setIsLiked(newLikedState);
    setLikesCount(newLikedState ? previousCount + 1 : Math.max(0, previousCount - 1));

    try {
      const response = await API.post(`/blogs/${blogId}/like`);
      if (response.data?.success) {
        setIsLiked(response.data.data.isLiked);
        setLikesCount(response.data.data.likesCount);
      }
    } catch (error) {
      // Revert on failure
      setIsLiked(previousIsLiked);
      setLikesCount(previousCount);
      showToast(error.message || 'Failed to update like.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isSmall = size === 'small';

  return (
    <button
      type="button"
      onClick={handleLikeToggle}
      className={`inline-flex items-center space-x-1.5 rounded-full border transition-all duration-150 cursor-pointer active:scale-95 z-10 ${
        isSmall ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'
      } ${
        isLiked
          ? 'bg-rose-50 border-rose-200 text-rose-600 font-bold shadow-xs'
          : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600 font-semibold'
      }`}
      title={isAuthenticated ? (isLiked ? 'Unlike article' : 'Like article') : 'Sign in to like'}
    >
      <Heart
        className={`transition-all duration-200 ${
          isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'
        } ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-gray-400'}`}
      />
      <span className="font-bold">{likesCount}</span>
      {!isSmall && (
        <span className="text-xs text-gray-500 hidden sm:inline font-medium">
          {isLiked ? 'Liked' : 'Like'}
        </span>
      )}
    </button>
  );
};

export default LikeButton;
