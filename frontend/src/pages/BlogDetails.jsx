import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  Eye,
  Share2,
  Calendar,
  ChevronLeft,
  PenSquare,
  Tag,
} from 'lucide-react';
import LikeButton from '../components/LikeButton/LikeButton';
import CommentSection from '../components/CommentSection/CommentSection';
import AuthorCard from '../components/AuthorCard/AuthorCard';
import BlogGrid from '../components/BlogGrid/BlogGrid';
import { PageSpinner } from '../components/Loading/SkeletonCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatTimeAgo, formatReadingTime } from '../utils/formatTime';
import API from '../services/api';

const BlogDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/blogs/slug/${slug}`);
        if (response.data?.success) {
          const blogData = response.data.data;
          setBlog(blogData);

          if (blogData.category) {
            API.get(`/blogs?category=${encodeURIComponent(blogData.category)}&limit=3`)
              .then((res) => {
                if (res.data?.success) {
                  setRelatedBlogs(res.data.data.blogs.filter((b) => b._id !== blogData._id));
                }
              })
              .catch(() => {});
          }
        }
      } catch (err) {
        showToast(err.message || 'Article not found.', 'error');
        navigate('/blogs');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlogDetails();
      window.scrollTo(0, 0);
    }
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Article link copied to clipboard!', 'success');
    }
  };

  if (loading) return <PageSpinner />;
  if (!blog) return null;

  const isAuthor = user && blog.author && user.id === blog.author._id;
  const timeAgoStr = formatTimeAgo(blog.publishedAt || blog.createdAt);
  const readTimeStr = formatReadingTime(blog.content, blog.readingTime);

  return (
    <article className="pb-20">
      {/* Back Navigation Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <Link
          to="/blogs"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </Link>
      </div>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 rounded-full">
            {blog.category}
          </span>
          {blog.status === 'draft' && (
            <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-200 rounded-full">
              Draft
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
          {blog.title}
        </h1>

        <p className="text-lg text-gray-600 leading-relaxed font-sans">
          {blog.description}
        </p>

        {/* Author Header Meta */}
        <div className="pt-6 border-t border-b border-gray-200 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {blog.author && (
            <Link
              to={`/author/${blog.author.username}`}
              className="flex items-center space-x-3 group"
            >
              {blog.author.profileImage?.url ? (
                <img
                  src={blog.author.profileImage.url}
                  alt={blog.author.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200 group-hover:border-emerald-500 transition-colors"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 text-lg group-hover:border-emerald-500 transition-colors">
                  <i className="fa-solid fa-user"></i>
                </div>
              )}
              <div className="text-left">
                <p className="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {blog.author.name}
                </p>
                <div className="flex items-center space-x-3 text-xs text-gray-500 font-medium">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{timeAgoStr}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{readTimeStr}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                    <span>{blog.views || 0} views</span>
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {isAuthor && (
              <Link
                to={`/dashboard/blogs/edit/${blog._id}`}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-gray-100 border border-gray-300 text-gray-800 hover:bg-gray-200 text-xs font-bold transition-colors"
              >
                <PenSquare className="w-4 h-4 text-emerald-600" />
                <span>Edit Article</span>
              </Link>
            )}

            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors shadow-xs"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <LikeButton
              blogId={blog._id}
              initialIsLiked={blog.isLikedByCurrentUser}
              initialLikesCount={blog.likesCount}
            />
          </div>
        </div>
      </header>

      {/* Featured Cover Image */}
      {blog.coverImage?.url && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 my-10">
          <div className="aspect-[21/9] rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 card-shadow">
            <img
              src={blog.coverImage.url}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div
          className="prose-editorial"
          dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br/>') }}
        />

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="pt-8 mt-12 border-t border-gray-200 flex items-center space-x-2 flex-wrap gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            {blog.tags.map((tag) => (
              <Link
                key={tag}
                to={`/blogs?tag=${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 rounded-lg border border-gray-200 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Author Bio Box */}
        {blog.author && (
          <div className="mt-12">
            <AuthorCard author={blog.author} />
          </div>
        )}

        {/* Comments */}
        <div className="mt-16">
          <CommentSection blogId={blog._id} blogAuthorId={blog.author?._id} />
        </div>
      </div>

      {/* Related Articles */}
      {relatedBlogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-12 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Related Articles in {blog.category}</h3>
          <BlogGrid blogs={relatedBlogs} />
        </section>
      )}
    </article>
  );
};

export default BlogDetails;
