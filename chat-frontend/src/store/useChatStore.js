import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// Create socket instance
let socket = null;

export const useChatStore = create((set, get) => ({
  // State
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  searchResults: [],
  socket: null,
  isConnected: false,
  typingUsers: new Set(),

  // Socket connection management
  connectSocket: (userId, token) => {
    if (socket) {
      socket.disconnect();
    }

    socket = io('http://localhost:5000', {
      auth: {
        token: token
      },
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      set({ isConnected: true, socket });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ isConnected: false });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      set({ isConnected: false });
      toast.error('Connection failed. Please refresh the page.');
    });

    // Handle user status changes
    socket.on('user_status_change', ({ userId, isOnline, username }) => {
      console.log(`User ${username || userId} is now ${isOnline ? 'online' : 'offline'}`);
      
      set((state) => {
        const updatedUsers = state.users.map(user => 
          user._id === userId ? { ...user, isOnline } : user
        );
        const updatedSearchResults = state.searchResults.map(user => 
          user._id === userId ? { ...user, isOnline } : user
        );
        
        return {
          users: updatedUsers,
          searchResults: updatedSearchResults
        };
      });
    });

    // Handle new messages
    socket.on('new_message', (message) => {
      console.log('New message received:', message);
      set((state) => ({
        messages: [...state.messages, message]
      }));
    });

    // Handle message sent confirmation
    socket.on('message_sent', (message) => {
      console.log('Message sent successfully:', message);
      set((state) => ({
        messages: [...state.messages, message]
      }));
    });

    // Handle message errors
    socket.on('message_error', (error) => {
      console.error('Message error:', error);
      toast.error('Failed to send message');
    });

    // Handle typing indicators
    socket.on('user_typing', ({ userId, username }) => {
      set((state) => ({
        typingUsers: new Set([...state.typingUsers, userId])
      }));
    });

    socket.on('user_stopped_typing', ({ userId }) => {
      set((state) => {
        const newTypingUsers = new Set(state.typingUsers);
        newTypingUsers.delete(userId);
        return { typingUsers: newTypingUsers };
      });
    });
  },

  disconnectSocket: () => {
    if (socket) {
      socket.emit('user_offline');
      socket.disconnect();
      socket = null;
      set({ socket: null, isConnected: false, typingUsers: new Set() });
    }
  },

  // Send message via Socket.IO
  sendMessageSocket: (messageData) => {
    if (socket && socket.connected) {
      const { selectedUser } = get();
      socket.emit('send_message', {
        receiverId: selectedUser._id,
        text: messageData.text,
        imageUrl: messageData.image,
        audioUrl: messageData.audio
      });
      return true;
    }
    return false;
  },

  // Start typing indicator
  startTyping: () => {
    if (socket && socket.connected) {
      const { selectedUser } = get();
      socket.emit('typing_start', { receiverId: selectedUser._id });
    }
  },

  // Stop typing indicator
  stopTyping: () => {
    if (socket && socket.connected) {
      const { selectedUser } = get();
      socket.emit('typing_stop', { receiverId: selectedUser._id });
    }
  },

  // Actions
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await api.get('/auth/messages/conversations');
      set({ users: res.data.data });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await api.get(`/auth/messages/${userId}`);
      set({ messages: res.data.data.messages });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load messages');
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    
    // Try Socket.IO first
    const sentViaSocket = get().sendMessageSocket(messageData);
    
    if (!sentViaSocket) {
      // Fallback to REST API
      try {
        const res = await api.post('/auth/messages/send', {
          text: messageData.text,
          imageUrl: messageData.image,
          audioUrl: messageData.audio,
          receiverId: selectedUser._id,
        });
        set({ messages: [...messages, res.data.data] });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send message');
      }
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await api.delete(`/auth/messages/${messageId}`);
      set((state) => ({
        messages: state.messages.filter(msg => msg._id !== messageId)
      }));
      toast.success('Message deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete message');
    }
  },

  pinMessage: async (messageId) => {
    try {
      const res = await api.post(`/auth/messages/${messageId}/pin`);
      set((state) => ({
        messages: state.messages.map(msg => 
          msg._id === messageId ? { ...msg, isPinned: true, pinnedBy: res.data.data.pinnedBy, pinnedAt: res.data.data.pinnedAt } : msg
        )
      }));
      toast.success('Message pinned successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to pin message');
    }
  },

  unpinMessage: async (messageId) => {
    try {
      await api.delete(`/auth/messages/${messageId}/pin`);
      set((state) => ({
        messages: state.messages.map(msg => 
          msg._id === messageId ? { ...msg, isPinned: false, pinnedBy: null, pinnedAt: null } : msg
        )
      }));
      toast.success('Message unpinned successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unpin message');
    }
  },

  getPinnedMessages: async (userId) => {
    try {
      const res = await api.get(`/auth/messages/${userId}/pinned`);
      return res.data.data;
    } catch (error) {
      console.error('Failed to get pinned messages:', error);
      return [];
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  searchUsers: async (searchTerm) => {
    if (!searchTerm) {
      set({ searchResults: [] });
      return;
    }
    try {
      const res = await api.get(`/auth/users?search=${encodeURIComponent(searchTerm)}`);
      set({ searchResults: res.data.users });
    } catch (error) {
      set({ searchResults: [] });
    }
  },

  // Socket.io methods for real-time updates
  subscribeToMessages: () => {
    if (socket) {
      // Listen for new messages
      socket.on('new_message', (message) => {
        set((state) => ({
          messages: [...state.messages, message]
        }));
      });
    }
  },

  unsubscribeFromMessages: () => {
    if (socket) {
      socket.off('new_message');
    }
  },
}));