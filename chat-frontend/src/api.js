// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://live-chat-app-vw20.onrender.com/api', // Fixed to include /api
  withCredentials: true, // This allows cookies to be sent with requests
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('jwt') || localStorage.getItem('token');
    
    console.log('🔍 API Request Debug:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log('❌ API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url
    });
    
    // Only clear tokens if backend explicitly says token invalid/expired
    if (error.response?.status === 401) {
      const code = error.response?.data?.code;
      const shouldClear = code === 'TOKEN_EXPIRED' || code === 'TOKEN_INVALID' || code === 'AUTH_REQUIRED';
      if (shouldClear) {
        console.log('🚨 401 with token problem - clearing tokens');
        localStorage.removeItem('jwt');
        localStorage.removeItem('token');
        localStorage.removeItem('authUser');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login';
        }
      } else {
        console.log('⚠️ 401 but preserving session (likely CSRF/cookie or transient)');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
