import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Upload,
  Save,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { PageSpinner } from '../../components/Loading/SkeletonCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Technology');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState('published');

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Technology',
    'AI',
    'Web Development',
    'Programming',
    'Design',
    'Career',
    'Business',
    'Productivity',
    'Startups',
    'Tutorials',
  ];

  useEffect(() => {
    const fetchBlogForEdit = async () => {
      try {
        setLoading(true);
        const response = await API.get('/blogs?status=all&limit=100');
        if (response.data?.success) {
          const blogToEdit = response.data.data.blogs.find((b) => b._id === id);
          if (!blogToEdit) {
            showToast('Blog post not found or you are not authorized to edit it.', 'error');
            navigate('/dashboard/blogs');
            return;
          }

          if (blogToEdit.author?._id !== user.id && user.role !== 'admin') {
            showToast('Forbidden: Only the blog author can edit this post.', 'error');
            navigate('/dashboard/blogs');
            return;
          }

          setTitle(blogToEdit.title);
          setSlug(blogToEdit.slug);
          setDescription(blogToEdit.description);
          setContent(blogToEdit.content);
          setCategory(blogToEdit.category);
          setTagsInput(blogToEdit.tags ? blogToEdit.tags.join(', ') : '');
          setStatus(blogToEdit.status);
          setCoverImagePreview(blogToEdit.coverImage?.url || '');
        }
      } catch (err) {
        showToast(err.message || 'Failed to load blog for editing.', 'error');
        navigate('/dashboard/blogs');
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchBlogForEdit();
    }
  }, [id, user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Cover image size must be under 5MB.', 'error');
        return;
      }
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e, forcedStatus = null) => {
    if (e) e.preventDefault();
    const finalStatus = forcedStatus || status;

    if (!title.trim() || !description.trim() || !content.trim() || !category) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('content', content);
      formData.append('category', category);
      formData.append('tags', tagsInput);
      formData.append('status', finalStatus);

      if (coverImageFile) {
        formData.append('coverImage', coverImageFile);
      } else if (coverImagePreview) {
        formData.append('coverImageUrl', coverImagePreview);
      }

      const response = await API.put(`/blogs/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success) {
        showToast('Blog updated successfully!', 'success');
        navigate('/dashboard/blogs');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update blog post.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard/blogs')}
            className="inline-flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-900 mb-2 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Blogs</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Edit Article</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={submitting}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-amber-600" />
            <span>Save as Draft</span>
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={submitting}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition-all disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{submitting ? 'Updating...' : 'Update Article'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, status)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Article Title</label>
          <input
            type="text"
            required
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-lg font-bold text-gray-900 focus:outline-none focus:border-emerald-600 card-shadow"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Short Description</label>
          <textarea
            rows={3}
            required
            maxLength={300}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-emerald-600 resize-none card-shadow"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Cover Image</label>
          {coverImagePreview && (
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-gray-300 bg-gray-100 mb-3 shadow-xs">
              <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-xs text-gray-600 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Tags</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Article Content</label>
          <textarea
            rows={16}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-5 bg-white border border-gray-300 rounded-2xl text-gray-900 font-mono text-sm focus:outline-none focus:border-emerald-600 leading-relaxed card-shadow"
          />
        </div>
      </form>
    </div>
  );
};

export default EditBlog;
