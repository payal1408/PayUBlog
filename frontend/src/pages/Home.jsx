import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  Users,
  Layers,
  PenSquare,
  Compass,
  CreditCard,
} from 'lucide-react';
import BlogGrid from '../components/BlogGrid/BlogGrid';
import { PageSpinner } from '../components/Loading/SkeletonCard';
import API from '../services/api';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [blogsRes, catRes, author1Res, author2Res] = await Promise.all([
          API.get('/blogs?limit=7'),
          API.get('/blogs/categories/stats').catch(() => null),
          API.get('/users/author/rahul_sharma').catch(() => null),
          API.get('/users/author/ananya_verma').catch(() => null),
        ]);

        if (blogsRes.data?.success) {
          setBlogs(blogsRes.data.data.blogs);
        }

        if (catRes?.data?.success) {
          setCategories(catRes.data.data);
        } else {
          setCategories([
            { name: 'Technology', count: 0 },
            { name: 'AI', count: 0 },
            { name: 'Web Development', count: 0 },
            { name: 'Design', count: 0 },
            { name: 'Productivity', count: 0 },
          ]);
        }

        const fetchedAuthors = [];
        if (author1Res?.data?.data?.author) fetchedAuthors.push(author1Res.data.data);
        if (author2Res?.data?.data?.author) fetchedAuthors.push(author2Res.data.data);
        setAuthors(fetchedAuthors);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const featuredBlog = blogs[0];
  const trendingBlogs = blogs.slice(1, 4);
  const latestBlogs = blogs.slice(4);

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
              <CreditCard className="w-3.5 h-3.5" />
              <span>PayUBlog — Engineering & Technology Insights</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
              Insights for Modern <span className="text-emerald-600">Engineers & Creators</span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed font-sans max-w-2xl mx-auto">
              Explore practical guides on payment integrations, full-stack architecture, React performance, and scalable backend infrastructure.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/blogs"
                className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Articles</span>
              </Link>
              <Link
                to="/dashboard/blogs/create"
                className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm border border-gray-300 transition-colors shadow-sm"
              >
                <PenSquare className="w-4 h-4 text-emerald-600" />
                <span>Write Blog</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Story */}
      {featuredBlog && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Article</h2>
            </div>
          </div>

          <div className="group bg-white border border-gray-200 rounded-3xl overflow-hidden card-shadow hover:shadow-xl transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-gray-100">
                <img
                  src={featuredBlog.coverImage?.url}
                  alt={featuredBlog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                    {featuredBlog.category}
                  </span>

                  <Link to={`/blog/${featuredBlog.slug}`} className="block group-hover:text-emerald-600 transition-colors">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                      {featuredBlog.title}
                    </h3>
                  </Link>

                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {featuredBlog.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  {featuredBlog.author && (
                    <Link
                      to={`/author/${featuredBlog.author.username}`}
                      className="flex items-center space-x-3 group/author"
                    >
                      {featuredBlog.author.profileImage?.url ? (
                        <img
                          src={featuredBlog.author.profileImage.url}
                          alt={featuredBlog.author.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600">
                          <i className="fa-solid fa-user text-sm"></i>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-gray-900 group-hover/author:text-emerald-600 transition-colors">
                          {featuredBlog.author.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(featuredBlog.publishedAt || featuredBlog.createdAt).toLocaleDateString()} • {featuredBlog.readingTime || 1} min read
                        </p>
                      </div>
                    </Link>
                  )}

                  <Link
                    to={`/blog/${featuredBlog.slug}`}
                    className="p-3 rounded-full bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trending Stories */}
      {trendingBlogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Trending Discussions</h2>
            </div>
            <Link to="/blogs" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <BlogGrid blogs={trendingBlogs} />
        </section>
      )}

      {/* Categories (Dynamic Category Statistics from Database) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 bg-white border border-gray-200 rounded-3xl space-y-6 card-shadow">
          <div className="flex items-center space-x-3">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Browse Categories</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/blogs?category=${encodeURIComponent(cat.name)}`}
                className="group p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-emerald-500 transition-all text-center space-y-1 hover:translate-y-[-2px]"
              >
                <h4 className="text-base font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  {cat.count === 1 ? '1 Article' : `${cat.count} Articles`}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      {latestBlogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Latest Articles</h2>
            <Link to="/blogs" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
              <span>Explore All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <BlogGrid blogs={latestBlogs} />
        </section>
      )}

      {/* Authors Showcase */}
      {authors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-8">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Authors</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {authors.map((item) => (
              <Link
                key={item.author._id}
                to={`/author/${item.author.username}`}
                className="p-6 bg-white border border-gray-200 rounded-2xl flex items-center space-x-5 hover:border-emerald-500 transition-all group card-shadow"
              >
                {item.author.profileImage?.url ? (
                  <img
                    src={item.author.profileImage.url}
                    alt={item.author.name}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 text-xl">
                    <i className="fa-solid fa-user"></i>
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {item.author.name}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-1">{item.author.bio}</p>
                  <p className="text-xs font-semibold text-emerald-600">{item.totalBlogs} Articles Published</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
