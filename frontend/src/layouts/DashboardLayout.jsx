import React from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageSpinner } from '../components/Loading/SkeletonCard';
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  User,
  LogOut,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return <PageSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Blogs', path: '/dashboard/blogs', icon: FileText },
    { name: 'Create Blog', path: '/dashboard/blogs/create', icon: PenSquare },
    { name: 'Profile Settings', path: '/dashboard/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col justify-between p-6 card-shadow">
        <div className="space-y-8">
          {/* PayUBlog CMS Header */}
          <Link to="/" className="flex items-center">
            <img
              src="/logo.svg"
              alt="PayUBlog CMS"
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* User Capsule */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center space-x-3">
            {user?.profileImage?.url ? (
              <img
                src={user.profileImage.url}
                alt={user?.name}
                className="w-10 h-10 rounded-xl object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-700">
                <i className="fa-solid fa-user text-base"></i>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-gray-100 space-y-2 mt-6">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
