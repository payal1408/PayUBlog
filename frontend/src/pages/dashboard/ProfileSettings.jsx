import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Camera, User, Twitter, Github, Linkedin, Globe, Lock, Save, CheckCircle } from 'lucide-react';
import API from '../../services/api';

const ProfileSettings = () => {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [socialLinks, setSocialLinks] = useState({
    twitter: user?.socialLinks?.twitter || '',
    github: user?.socialLinks?.github || '',
    linkedin: user?.socialLinks?.linkedin || '',
    website: user?.socialLinks?.website || '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.profileImage?.url || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Avatar image size must be under 5MB.', 'error');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name field cannot be empty.', 'error');
      return;
    }

    setUpdatingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('bio', bio.trim());
      formData.append('socialLinks', JSON.stringify(socialLinks));

      if (avatarFile) {
        formData.append('profileImage', avatarFile);
      }

      const response = await API.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success) {
        updateUserProfile(response.data.data.user);
        showToast('Profile updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please fill in current and new password.', 'error');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setUpdatingPassword(true);
    try {
      const response = await API.put('/users/change-password', {
        currentPassword,
        newPassword,
      });

      if (response.data?.success) {
        showToast('Password updated successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Profile & Security</h1>
        <p className="text-sm text-gray-600">Update your author bio, photo, social handles, and password</p>
      </div>

      {/* Profile Info Form */}
      <div className="p-8 bg-white border border-gray-200 rounded-3xl space-y-6 card-shadow">
        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <User className="w-5 h-5 text-emerald-600" />
          <span>Profile Details</span>
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {/* Avatar Upload with fa-solid fa-user icon fallback */}
          <div className="flex items-center space-x-6">
            <div className="relative group cursor-pointer shrink-0">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user?.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-200 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-600 text-3xl shadow-sm">
                  <i className="fa-solid fa-user"></i>
                </div>
              )}
              <label htmlFor="settings-avatar" className="absolute inset-0 bg-gray-900/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                <Camera className="w-6 h-6" />
              </label>
              <input
                id="settings-avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Profile Photo</h4>
              <p className="text-xs text-gray-500 mt-0.5">Click photo to update (Max 5MB)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Username</label>
              <input
                type="text"
                disabled
                value={user?.username || ''}
                className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Bio</label>
            <textarea
              rows={3}
              maxLength={300}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short author bio..."
              className="w-full p-3.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-emerald-600 resize-none"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Social Links</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Twitter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                  placeholder="https://twitter.com/username"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="relative">
                <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={socialLinks.github}
                  onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="relative">
                <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={socialLinks.website}
                  onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updatingProfile}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{updatingProfile ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Change */}
      <div className="p-8 bg-white border border-gray-200 rounded-3xl space-y-6 card-shadow">
        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <Lock className="w-5 h-5 text-amber-600" />
          <span>Security & Password</span>
        </h3>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-emerald-600 max-w-md"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updatingPassword}
              className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{updatingPassword ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
