import { useEffect } from 'react';
import { useChatStore } from '../Store/useChatStore';
import { useAuthStore } from '../Store/useAuthStore';

// Helper function to get JWT token from cookies
const getTokenFromCookies = () => {
  try {
    const cookies = document.cookie.split(';');
    const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
    if (jwtCookie) {
      return jwtCookie.split('=')[1];
    }
    
    // Try alternative cookie names
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
    
    // Check localStorage as fallback
    const localToken = localStorage.getItem('jwt') || localStorage.getItem('token');
    if (localToken) {
      return localToken;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting token from cookies:', error);
    return null;
  }
};

export const useSocket = () => {
  const { authUser } = useAuthStore();
  const { connectSocket, disconnectSocket, isConnected } = useChatStore();

  useEffect(() => {
    // Connect socket when user is authenticated
    if (authUser && !isConnected) {
      // Get token from HTTP-only cookies
      const token = getTokenFromCookies();
      
      console.log('Socket connection attempt:', {
        userId: authUser._id,
        username: authUser.username,
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        cookies: document.cookie
      });
      
      if (token) {
        console.log('Connecting socket with token for user:', authUser._id);
        connectSocket(authUser._id, token);
      } else {
        console.warn('No JWT token found in cookies or localStorage');
        console.log('Available cookies:', document.cookie);
        console.log('Available localStorage keys:', Object.keys(localStorage));
        
        // Try to get token from auth store if available
        if (authUser.token) {
          console.log('Using token from auth store');
          connectSocket(authUser._id, authUser.token);
        }
      }
    }

    // Cleanup function to disconnect socket when component unmounts or user changes
    return () => {
      if (authUser) {
        console.log('Disconnecting socket for user:', authUser._id);
        disconnectSocket();
      }
    };
  }, [authUser, isConnected, connectSocket, disconnectSocket]);

  // Handle page visibility change to update online status
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (authUser) {
        if (document.hidden) {
          // User switched tabs or minimized window
          // You could emit a "user_away" event here if needed
        } else {
          // User returned to the tab
          // You could emit a "user_back" event here if needed
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [authUser]);

  // Handle beforeunload to properly disconnect
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (authUser) {
        disconnectSocket();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [authUser, disconnectSocket]);

  return { isConnected };
}; 