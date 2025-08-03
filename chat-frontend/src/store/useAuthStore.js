import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'https://live-chat-app-vw20.onrender.com/api',
  withCredentials: true,
});

export const useAuthStore = create((set, get) => ({
  // State
  authUser: null,
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
    } catch (error) {
      console.log('Error in checkAuth:', error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await api.post('/auth/signup', data);
      set({ authUser: res.data.user });
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
      set({ authUser: res.data.user });
      toast.success('Logged in successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ authUser: null, onlineUsers: [] });
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
