import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar/SearchBar';
import BlogGrid from '../components/BlogGrid/BlogGrid';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import API from '../services/api';

const Blogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'latest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 9 });
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Technology',
    'AI',
    'Web Development',
    'Programming',
    'Design',
    'Productivity',
    'Tutorials',
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', '9');
        if (currentCategory && currentCategory !== 'All') params.set('category', currentCategory);
        if (currentTag) params.set('tag', currentTag);
        if (currentSearch) params.set('search', currentSearch);
        if (currentSort) params.set('sort', currentSort);

        const response = await API.get(`/blogs?${params.toString()}`);
        if (response.data?.success) {
          setBlogs(response.data.data.blogs);
          setPagination(response.data.data.pagination);
        }
      } catch (err) {
        console.error('Failed to load blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [currentCategory, currentTag, currentSearch, currentSort, currentPage]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Explore PayUBlog Articles
        </h1>
        <p className="text-gray-600 text-sm max-w-2xl">
          Discover guides on payment integrations, full-stack architecture, React development, and backend engineering.
        </p>
      </div>

      {/* Search & Sort Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8">
          <SearchBar
            initialQuery={currentSearch}
            onSearch={(query) => updateParam('search', query)}
          />
        </div>
        <div className="md:col-span-4 flex items-center justify-end">
          <div className="relative w-full flex items-center bg-white border border-gray-300 rounded-2xl px-4 py-3 text-sm text-gray-800 card-shadow">
            <SlidersHorizontal className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="w-full bg-transparent text-gray-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="latest">Latest Articles</option>
              <option value="popular">Most Popular / Viewed</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = (currentCategory === '' && cat === 'All') || currentCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => updateParam('category', cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Active Filter Indicator */}
      {(currentCategory || currentTag || currentSearch) && (
        <div className="flex items-center space-x-2 text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
          <span className="font-semibold">Active Filters:</span>
          {currentCategory && (
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              Category: {currentCategory}
            </span>
          )}
          {currentTag && (
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              Tag: #{currentTag}
            </span>
          )}
          {currentSearch && (
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              Search: "{currentSearch}"
            </span>
          )}
          <button
            onClick={() => setSearchParams({})}
            className="text-rose-600 hover:underline font-bold ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Blog Grid */}
      <BlogGrid
        blogs={blogs}
        loading={loading}
        emptyMessage="No articles match your search or filter options. Try adjusting your query."
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 font-medium">
            Page <span className="font-bold text-gray-900">{pagination.page}</span> of{' '}
            <span className="font-bold text-gray-900">{pagination.pages}</span> ({pagination.total} Total Articles)
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateParam('page', (pagination.page - 1).toString())}
              disabled={pagination.page <= 1}
              className="p-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 hover:text-gray-900 disabled:opacity-40 transition-colors shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateParam('page', (pagination.page + 1).toString())}
              disabled={pagination.page >= pagination.pages}
              className="p-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 hover:text-gray-900 disabled:opacity-40 transition-colors shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;
