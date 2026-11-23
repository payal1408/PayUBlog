import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      showToast('Please enter password in both fields.', 'error');
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
      await resetPassword(token, password);
      showToast('Password reset successfully! Redirecting...', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Invalid or expired reset token.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white border border-gray-200 p-8 rounded-3xl card-shadow">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <i className="fa-solid fa-credit-card text-lg"></i>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-gray-900 font-sans">
              PayU<span className="text-emerald-600">Blog</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Password</h2>
          <p className="text-sm text-gray-600">Set a new password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {submitting ? (
              <span>Updating Password...</span>
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
