import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  FileClock,
  Eye,
  Heart,
  MessageSquare,
  PenSquare,
  TrendingUp,
} from 'lucide-react';
import { PageSpinner } from '../../components/Loading/SkeletonCard';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

const DashboardOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await API.get('/blogs/dashboard/stats');
        if (response.data?.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) return <PageSpinner />;

  const {
    totalBlogs = 0,
    publishedBlogs = 0,
    draftBlogs = 0,
    totalViews = 0,
    totalLikes = 0,
    totalComments = 0,
    recentBlogs = [],
  } = stats || {};

  const statCards = [
    { name: 'Total Blogs', value: totalBlogs, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { name: 'Published', value: publishedBlogs, icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    { name: 'Drafts', value: draftBlogs, icon: FileClock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { name: 'Total Views', value: totalViews, icon: Eye, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' },
    { name: 'Total Likes', value: totalLikes, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { name: 'Total Comments', value: totalComments, icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 bg-white border border-gray-200 rounded-3xl card-shadow">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-gray-600">
            Manage your articles, review engagement stats, and create new posts.
          </p>
        </div>
        <Link
          to="/dashboard/blogs/create"
          className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all shrink-0"
        >
          <PenSquare className="w-4 h-4" />
          <span>Write New Article</span>
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.name}
              className="p-6 bg-white border border-gray-200 rounded-2xl flex flex-col justify-between space-y-4 card-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{card.name}</span>
                <div className={`p-2.5 rounded-xl border ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-gray-900">{card.value}</span>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="p-6 bg-white border border-gray-200 rounded-3xl space-y-6 card-shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Recent Posts</span>
          </h3>
          <Link to="/dashboard/blogs" className="text-xs font-bold text-emerald-600 hover:underline">
            View All Blogs
          </Link>
        </div>

        {recentBlogs.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <p className="text-gray-500 text-sm">You haven't published any articles yet.</p>
            <Link
              to="/dashboard/blogs/create"
              className="inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              Create Your First Blog
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Title</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Views</th>
                  <th className="py-3.5 px-4 font-bold">Last Updated</th>
                  <th className="py-3.5 px-4 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBlogs.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-gray-900 max-w-xs truncate">{b.title}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                          b.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{b.views || 0}</td>
                    <td className="py-4 px-4 text-gray-500 text-xs">
                      {new Date(b.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/dashboard/blogs/edit/${b._id}`}
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
