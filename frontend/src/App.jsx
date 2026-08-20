import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import BlogDetails from './pages/BlogDetails';
import AuthorProfile from './pages/AuthorProfile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Dashboard Pages
import DashboardOverview from './pages/dashboard/DashboardOverview';
import MyBlogs from './pages/dashboard/MyBlogs';
import CreateBlog from './pages/dashboard/CreateBlog';
import EditBlog from './pages/dashboard/EditBlog';
import ProfileSettings from './pages/dashboard/ProfileSettings';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Layout & Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="blogs" element={<Blogs />} />
              <Route path="blog/:slug" element={<BlogDetails />} />
              <Route path="author/:username" element={<AuthorProfile />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />
            </Route>

            {/* Authenticated Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="blogs" element={<MyBlogs />} />
              <Route path="blogs/create" element={<CreateBlog />} />
              <Route path="blogs/edit/:id" element={<EditBlog />} />
              <Route path="profile" element={<ProfileSettings />} />
            </Route>

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
