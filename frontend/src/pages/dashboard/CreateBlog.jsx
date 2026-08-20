import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  X,
  Save,
  CheckCircle,
  Edit3,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';

const CreateBlog = () => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isManualSlug, setIsManualSlug] = useState(false);
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Technology');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState('published');

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');

  const { showToast } = useToast();
  const navigate = useNavigate();

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
    if (!isManualSlug) {
      const generatedSlug = title
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
      setSlug(generatedSlug);
    }
  }, [title, isManualSlug]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Cover image size must be less than 5MB.', 'error');
        return;
      }
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview('');
  };

  const handleSubmit = async (e, forcedStatus = null) => {
    if (e) e.preventDefault();
    const finalStatus = forcedStatus || status;

    if (!title.trim() || !description.trim() || !content.trim() || !category) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (!coverImageFile && !coverImagePreview) {
      showToast('Please upload a cover image.', 'error');
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

      const response = await API.post('/blogs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success) {
        showToast(
          finalStatus === 'draft' ? 'Draft saved successfully.' : 'Blog published successfully!',
          'success'
        );
        navigate('/dashboard/blogs');
      }
    } catch (err) {
      showToast(err.message || 'Failed to publish blog post.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Create New Article</h1>
          <p className="text-sm text-gray-600">Compose and publish your post on PayUBlog</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={submitting}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-amber-600" />
            <span>Save Draft</span>
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={submitting}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition-all disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{submitting ? 'Publishing...' : 'Publish Post'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, status)} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Article Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Integrating PayU Payment Gateway in Node.js & React"
            className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-lg sm:text-xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 transition-colors card-shadow"
          />
        </div>

        {/* Slug */}
        <div className="p-4 bg-white border border-gray-200 rounded-2xl space-y-2 card-shadow">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider">URL Slug</span>
            <button
              type="button"
              onClick={() => setIsManualSlug(!isManualSlug)}
              className="text-emerald-600 hover:underline flex items-center space-x-1 font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isManualSlug ? 'Auto-Generate Slug' : 'Edit Slug Manually'}</span>
            </button>
          </div>
          <div className="flex items-center text-sm font-mono text-gray-800 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
            <span className="text-gray-400 select-none">/blog/</span>
            {isManualSlug ? (
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-transparent text-emerald-700 focus:outline-none w-full font-mono font-semibold"
              />
            ) : (
              <span className="text-emerald-700 truncate font-semibold">{slug || 'your-article-slug'}</span>
            )}
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Short Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            maxLength={300}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a short summary for post previews..."
            className="w-full p-4 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 transition-colors resize-none card-shadow"
          />
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Cover Image <span className="text-rose-500">*</span>
          </label>

          {coverImagePreview ? (
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-gray-300 bg-gray-100 group shadow-sm">
              <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-4 right-4 p-2 bg-gray-900/80 text-white rounded-xl backdrop-blur-xs hover:bg-rose-600 transition-colors"
                title="Remove Cover Image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-white text-center hover:border-emerald-500 transition-colors">
              <label htmlFor="cover-upload" className="cursor-pointer flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Click to upload cover image</p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP or GIF up to 5MB</p>
                </div>
              </label>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Category & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Tags (Comma separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. react, nodejs, payu, css"
              className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Article Content <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeTab === 'edit' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
                }`}
              >
                Write / Edit
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeTab === 'preview' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
                }`}
              >
                Live Preview
              </button>
            </div>
          </div>

          {activeTab === 'edit' ? (
            <textarea
              rows={16}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Article Headline&#10;&#10;Write your post content here using headings, paragraphs, lists, and code blocks."
              className="w-full p-5 bg-white border border-gray-300 rounded-2xl text-gray-900 font-mono text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-600 leading-relaxed card-shadow"
            />
          ) : (
            <div className="p-8 bg-white border border-gray-200 rounded-2xl min-h-[400px] card-shadow">
              <div
                className="prose-editorial"
                dangerouslySetInnerHTML={{ __html: content ? content.replace(/\n/g, '<br/>') : '<em>Nothing to preview yet...</em>' }}
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;
