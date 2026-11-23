import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user from token on initial app load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('aether_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await API.get('/auth/me');
        if (response.data?.success) {
          setUser(response.data.data.user);
        } else {
          localStorage.removeItem('aether_token');
        }
      } catch (err) {
        localStorage.removeItem('aether_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    if (response.data?.success) {
      const { token, user: userData } = response.data.data;
      localStorage.setItem('aether_token', token);
      setUser(userData);
      return response.data;
    }
    throw new Error(response.data?.message || 'Login failed');
  };

  // Signup handler (accepts FormData or Object)
  const signup = async (formData) => {
    // Let axios set Content-Type (incl. multipart boundary) automatically
    const response = await API.post('/auth/register', formData);
    if (response.data?.success) {
      const { token, user: userData } = response.data.data;
      localStorage.setItem('aether_token', token);
      setUser(userData);
      return response.data;
    }
    throw new Error(response.data?.message || 'Registration failed');
  };

  // Reset password handler (logs user in on success)
  const resetPassword = async (token, password) => {
    const response = await API.post('/auth/reset-password', { token, password });
    if (response.data?.success) {
      const { token: newToken } = response.data.data;
      localStorage.setItem('aether_token', newToken);
      const me = await API.get('/auth/me');
      setUser(me.data.data.user);
      return response.data;
    }
    throw new Error(response.data?.message || 'Password reset failed');
  };

  // Logout handler
  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (e) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('aether_token');
      setUser(null);
    }
  };

  // Update User Profile
  const updateUserProfile = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        resetPassword,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
