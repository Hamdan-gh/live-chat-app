import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './Store/useAuthStore.js';
import { useThemeStore } from './Store/useThemeStore.js';
import { useSocket } from './hooks/useSocket.js';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import HomePage from './pages/HomePage.jsx';
import Navbar from './components/layout/Navbar.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import SocketStatus from './components/chat/SocketStatus.jsx';
import { Toaster } from 'react-hot-toast';

const App = () => {
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();
  const { initializeTheme } = useThemeStore();
  
  // Initialize socket connection for authenticated users
  const { isConnected } = useSocket();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      {authUser && <Navbar />}
      <Routes>
        <Route
          path="/login"
          element={authUser ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={authUser ? <Navigate to="/" /> : <SignUpPage />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={authUser ? <SettingsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
      </Routes>
      {authUser && <SocketStatus />}
    </div>
  );
};

export default App;