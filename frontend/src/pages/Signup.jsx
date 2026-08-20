import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Lock, Mail, User, AtSign, Camera, ArrowRight } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Profile image size must be under 5MB.', 'error');
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, username, email, password, confirmPassword, bio } = formData;

    if (!name || !username || !email || !password) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', name.trim());
      data.append('username', username.trim().toLowerCase());
      data.append('email', email.trim().toLowerCase());
      data.append('password', password);
      if (bio) data.append('bio', bio.trim());
      if (profileImage) data.append('profileImage', profileImage);

      await signup(data);
      showToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Registration failed. Username or email may already exist.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8 bg-white border border-gray-200 p-8 rounded-3xl card-shadow">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <img
              src="/logo.svg"
              alt="PayUBlog Logo"
              className="h-10 w-auto mx-auto object-contain"
            />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create Author Account</h2>
          <p className="text-sm text-gray-600">Sign up to publish articles and manage your posts</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload with fa-solid fa-user icon fallback */}
          <div className="flex flex-col items-center justify-center space-y-2 pb-2">
            <div className="relative group cursor-pointer">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-200 group-hover:border-emerald-600 transition-colors shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-500 text-3xl group-hover:border-emerald-600 transition-colors shadow-sm">
                  <i className="fa-solid fa-user"></i>
                </div>
              )}
              <label htmlFor="avatar-upload" className="absolute inset-0 bg-gray-900/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                <Camera className="w-6 h-6" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">Click photo to upload custom avatar (Optional)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Rahul Sharma"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Username</label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="rahul_sharma"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="rahul@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4 cursor-pointer"
          >
            {submitting ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 pt-4 border-t border-gray-100">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
