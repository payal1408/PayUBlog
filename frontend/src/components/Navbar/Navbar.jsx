import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  PenSquare,
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore Blogs', path: '/blogs' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm py-3'
          : 'bg-white py-4 border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Official PayUBlog SVG Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="/logo.svg"
              alt="PayUBlog Logo"
              className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-102"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-gray-100/80 p-1.5 rounded-full border border-gray-200/80">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => navigate('/blogs')}
              className="p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-colors"
              title="Search Articles"
            >
              <Search className="w-4 h-4" />
            </button>

            <Link
              to={isAuthenticated ? '/dashboard/blogs/create' : '/login'}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/15 active:scale-[0.98] transition-all"
            >
              <PenSquare className="w-4 h-4" />
              <span>Write Blog</span>
            </Link>

            {/* Auth Profile Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  {user?.profileImage?.url ? (
                    <img
                      src={user.profileImage.url}
                      alt={user?.name}
                      className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-700">
                      <i className="fa-solid fa-user text-sm"></i>
                    </div>
                  )}
                  <span className="text-xs font-bold text-gray-800 max-w-[110px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-50 divide-y divide-gray-100"
                    >
                      <div className="px-3 py-2.5 mb-1 flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                          <i className="fa-solid fa-user text-sm"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/dashboard/blogs"
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span>My Blogs</span>
                        </Link>
                        <Link
                          to="/dashboard/blogs/create"
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <PenSquare className="w-4 h-4 text-emerald-600" />
                          <span>Create Blog</span>
                        </Link>
                        <Link
                          to={`/author/${user?.username}`}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <User className="w-4 h-4 text-emerald-600" />
                          <span>Public Profile</span>
                        </Link>
                      </div>

                      <div className="pt-1 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:text-gray-900 bg-gray-100 border border-gray-200"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200 overflow-hidden shadow-lg"
          >
            <div className="px-4 pt-3 pb-6 space-y-3">
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="px-4 py-2.5 rounded-xl text-base font-semibold text-gray-800 hover:bg-gray-100"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="pt-3 border-t border-gray-100 flex flex-col space-y-2">
                <Link
                  to={isAuthenticated ? '/dashboard/blogs/create' : '/login'}
                  className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-md"
                >
                  <PenSquare className="w-4 h-4" />
                  <span>Write Blog</span>
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/blogs"
                      className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      My Blogs
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-left px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link
                      to="/login"
                      className="text-center py-2.5 rounded-xl border border-gray-300 text-gray-800 font-semibold text-sm"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="text-center py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
