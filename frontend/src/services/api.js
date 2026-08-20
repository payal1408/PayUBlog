import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aether_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format Error Messages
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
      data: error.response?.data || null,
    };

    if (error.response?.status === 401) {
      // Clear token on 401 Unauthorized if not logging in/registering
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/signup')) {
        localStorage.removeItem('aether_token');
      }
    }

    return Promise.reject(customError);
  }
);

export default API;
