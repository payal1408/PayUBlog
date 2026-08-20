import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Github, Twitter, Linkedin, Heart, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    showToast('Subscribed! Thank you for subscribing to PayUBlog updates.', 'success');
    setEmail('');
  };

  const categories = [
    'Technology',
    'AI',
    'Web Development',
    'Programming',
    'Design',
    'Productivity',
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="flex items-center group">
              <img
                src="/logo.svg"
                alt="PayUBlog Logo"
                className="h-9 w-auto object-contain"
              />
            </Link>

            <p className="text-gray-600 text-sm leading-relaxed pr-4">
              PayUBlog is an engineering publication platform for developers, tech enthusiasts, and system architects.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
                title="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:support@payublog.com"
                className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
                title="Contact Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Top Categories</h4>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/blogs?category=${encodeURIComponent(cat)}`}
                    className="text-sm text-gray-600 hover:text-emerald-600 transition-colors font-medium"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Platform Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors font-medium">
                  Explore Blogs
                </Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/dashboard" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors font-medium">
                      CMS Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard/blogs/create" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors font-medium">
                      Create Article
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors font-medium">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors font-medium">
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">PayUBlog Newsletter</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Get weekly updates on software architecture, payment integration, and React tips straight to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 transition-colors pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                  title="Subscribe"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar with Created by Payal Sharma */}
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} PayUBlog Inc. All rights reserved.</p>
          <p className="font-bold text-gray-900 flex items-center space-x-1 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-emerald-800">
            <span>Created with</span>
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>by <strong className="text-emerald-900 font-extrabold">Payal Sharma</strong></span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
