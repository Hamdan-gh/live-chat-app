import { create } from 'zustand';
import toast from 'react-hot-toast';
import api from '../api.js';

export const useAuthStore = create((set, get) => ({
  // State
  authUser: (() => {
    try {
      const saved = localStorage.getItem('authUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],

  // Actions
  checkAuth: async () => {
    try {
      const res = await api.get('/auth/check');
      set({ authUser: res.data.user });
      try { localStorage.setItem('authUser', JSON.stringify(res.data.user)); } catch {}
      
      // Save the JWT token to localStorage if it's returned
      if (res.data.token) {
        localStorage.setItem('jwt', res.data.token);
      }
    } catch (error) {
      const status = error?.response?.status;
      console.log('Error in checkAuth:', status, error?.response?.data || error?.message);
      if (status === 401) {
        set({ authUser: null });
        // Clear any invalid tokens
        localStorage.removeItem('jwt');
        localStorage.removeItem('token');
        localStorage.removeItem('authUser');
      } else {
        // Network/other error: keep existing session and do not clear token
        const existing = get().authUser;
        if (existing) set({ authUser: existing });
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await api.post('/auth/signup', data);
      set({ authUser: res.data.user });
      try { localStorage.setItem('authUser', JSON.stringify(res.data.user)); } catch {}
      
      // Save the JWT token to localStorage
      if (res.data.token) {
        localStorage.setItem('jwt', res.data.token);
      }
      
      toast.success('Account created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await api.post('/auth/login', data);
      console.log('✅ Login Response:', res.data);
      set({ authUser: res.data.user });
      try { localStorage.setItem('authUser', JSON.stringify(res.data.user)); } catch {}
      
      // Save the JWT token to localStorage
      if (res.data.token) {
        localStorage.setItem('jwt', res.data.token);
        console.log('✅ Token saved to localStorage');
      } else {
        console.log('❌ No token in login response');
      }
      
      toast.success('Logged in successfully');
    } catch (error) {
      console.log('❌ Login Error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ authUser: null, onlineUsers: [] });
      
      // Clear the JWT token from localStorage
      localStorage.removeItem('jwt');
      localStorage.removeItem('token');
      localStorage.removeItem('authUser');
      
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Logout failed');
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      console.log("➡️ SENDING TO BACKEND:", data);

      const res = await api.put('/auth/profile', data);
      console.log("✅ BACKEND RESPONSE:", res.data);
      console.log("✅ USER DATA:", res.data.user);
      
      // Update the authUser with the returned user data
      set({ authUser: res.data.user });
      try { localStorage.setItem('authUser', JSON.stringify(res.data.user)); } catch {}
      console.log("✅ AUTH USER UPDATED:", res.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error("🛑 BACKEND RESPONSE:", error.response?.data || error);
      toast.error(error.response?.data?.message || 'Profile update failed');
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Update online users list
  updateOnlineUsers: (onlineUsers) => {
    set({ onlineUsers });
  },

}));
