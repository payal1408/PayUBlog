import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import API from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSubmitted(true);
      showToast('Password reset link has been dispatched.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to request password reset.', 'error');
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
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reset Password</h2>
          <p className="text-sm text-gray-600">Enter your account email to receive a password reset link</p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
            <h4 className="text-base font-bold text-emerald-800">Check Your Email</h4>
            <p className="text-xs text-gray-700 leading-relaxed">
              We dispatched a reset link to <span className="font-bold text-gray-900">{email}</span>. Please check your inbox.
            </p>
            <Link
              to="/login"
              className="inline-block px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="author@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Sending Link...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-gray-100 text-center">
          <Link to="/login" className="inline-flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
