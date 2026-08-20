import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  PenSquare,
  Trash2,
  Eye,
  Heart,
  MessageSquare,
  Search,
  Plus,
  ExternalLink,
} from 'lucide-react';
import DeleteModal from '../../components/Modal/DeleteModal';
import { PageSpinner } from '../../components/Loading/SkeletonCard';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';

const MyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [deleteBlogTarget, setDeleteBlogTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      const response = await API.get('/blogs?status=all&limit=100');
      if (response.data?.success) {
        setBlogs(response.data.data.blogs);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load blogs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteBlogTarget) return;

    setIsDeleting(true);
    try {
      const response = await API.delete(`/blogs/${deleteBlogTarget._id}`);
      if (response.data?.success) {
        setBlogs(blogs.filter((b) => b._id !== deleteBlogTarget._id));
        showToast('Blog deleted successfully.', 'success');
        setDeleteBlogTarget(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete blog.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBlogs = blogs.filter((b) => {
    const matchesTab = activeTab === 'all' || b.status === activeTab;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Blogs</h1>
          <p className="text-sm text-gray-600">Manage and edit your published articles and draft posts</p>
        </div>
        <Link
          to="/dashboard/blogs/create"
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Blog</span>
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-2xl card-shadow">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 w-full sm:w-auto bg-gray-100 p-1 rounded-xl border border-gray-200">
          {['all', 'published', 'draft'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab} ({blogs.filter((b) => tab === 'all' || b.status === tab).length})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search my posts..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Blogs Table */}
      {filteredBlogs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4 card-shadow">
          <FileText className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">No Blogs Found</h3>
          <p className="text-sm text-gray-600 max-w-sm mx-auto">
            {blogs.length === 0
              ? "You haven't written any blogs yet. Create your first post today."
              : 'No posts match your active filter tab or search keywords.'}
          </p>
          {blogs.length === 0 && (
            <Link
              to="/dashboard/blogs/create"
              className="inline-block px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-sm"
            >
              Create Your First Blog
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden card-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 font-bold">Title & Category</th>
                  <th className="py-4 px-4 font-bold">Status</th>
                  <th className="py-4 px-4 font-bold">Views</th>
                  <th className="py-4 px-4 font-bold">Likes</th>
                  <th className="py-4 px-4 font-bold">Comments</th>
                  <th className="py-4 px-4 font-bold">Last Updated</th>
                  <th className="py-4 px-6 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold uppercase text-emerald-600">
                          {blog.category}
                        </span>
                        <h4 className="text-base font-bold text-gray-900 max-w-md line-clamp-1">
                          {blog.title}
                        </h4>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                          blog.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {blog.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        <span>{blog.views || 0}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>{blog.likesCount || 0}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{blog.commentsCount || 0}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs text-gray-500">
                      {new Date(blog.updatedAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/blog/${blog.slug}`}
                          target="_blank"
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Public Article"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/dashboard/blogs/edit/${blog._id}`}
                          className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Article"
                        >
                          <PenSquare className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setDeleteBlogTarget(blog)}
                          className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deleteBlogTarget}
        onClose={() => setDeleteBlogTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Delete Blog Post?"
        message={`Are you sure you want to delete "${deleteBlogTarget?.title}"?`}
      />
    </div>
  );
};

export default MyBlogs;
