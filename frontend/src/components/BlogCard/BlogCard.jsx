import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import LikeButton from '../LikeButton/LikeButton';
import { formatTimeAgo, formatReadingTime } from '../../utils/formatTime';

const BlogCard = ({ blog }) => {
  const navigate = useNavigate();
  if (!blog) return null;

  const {
    _id,
    title,
    slug,
    description,
    content,
    coverImage,
    category,
    author,
    readingTime,
    likesCount = 0,
    commentsCount = 0,
    isLikedByCurrentUser = false,
    publishedAt,
    createdAt,
  } = blog;

  const timeAgoStr = formatTimeAgo(publishedAt || createdAt);
  const readTimeStr = formatReadingTime(content || description, readingTime);

  const handleCommentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/blog/${slug}#comments`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-200 flex flex-col h-full card-shadow hover:shadow-lg relative"
    >
      {/* Cover Image */}
      <Link to={`/blog/${slug}`} className="relative aspect-[16/9] overflow-hidden bg-gray-100 block">
        <img
          src={coverImage?.url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-white/90 border border-gray-200 rounded-full shadow-sm backdrop-blur-sm">
            {category || 'General'}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <Link to={`/blog/${slug}`} className="block">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
              {title}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Footer Meta Row */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          {/* Author info & dynamic time */}
          {author && (
            <Link
              to={`/author/${author.username}`}
              className="flex items-center space-x-2.5 group/author shrink-0"
            >
              {author.profileImage?.url ? (
                <img
                  src={author.profileImage.url}
                  alt={author.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 group-hover/author:border-emerald-500 transition-colors"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 group-hover/author:border-emerald-500 transition-colors">
                  <i className="fa-solid fa-user text-xs"></i>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-800 group-hover/author:text-emerald-600 transition-colors">
                  {author.name}
                </span>
                <span className="text-[11px] text-gray-500 font-medium">{timeAgoStr}</span>
              </div>
            </Link>
          )}

          {/* Dynamic Metrics */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1 text-gray-500 mr-1 font-medium" title="Estimated Reading Time">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{readTimeStr}</span>
            </div>

            {/* Interactive Like Button */}
            <LikeButton
              blogId={_id}
              initialIsLiked={isLikedByCurrentUser}
              initialLikesCount={likesCount}
              size="small"
            />

            {/* Interactive Comment Button */}
            <button
              type="button"
              onClick={handleCommentClick}
              className="flex items-center space-x-1 px-2 py-1 rounded-full border border-gray-200 hover:border-emerald-300 text-gray-600 hover:text-emerald-600 transition-colors cursor-pointer"
              title="View Discussion & Comment"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold text-xs">{commentsCount}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default BlogCard;
