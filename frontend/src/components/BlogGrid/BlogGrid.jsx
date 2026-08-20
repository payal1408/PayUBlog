import React from 'react';
import BlogCard from '../BlogCard/BlogCard';
import { SkeletonCard } from '../Loading/SkeletonCard';
import { SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogGrid = ({ blogs = [], loading = false, emptyMessage = 'No blogs found matching your criteria.' }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <SkeletonCard key={n} />
        ))}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center my-8 flex flex-col items-center justify-center card-shadow">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 mb-4">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Articles Found</h3>
        <p className="text-gray-600 text-sm max-w-md mb-6">{emptyMessage}</p>
        <Link
          to="/blogs"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md"
        >
          Reset Filters & View All
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {blogs.map((blog) => (
        <BlogCard key={blog._id || blog.slug} blog={blog} />
      ))}
    </div>
  );
};

export default BlogGrid;
