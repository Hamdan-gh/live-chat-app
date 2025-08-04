import React, { useEffect, useState } from 'react';
import api from '../../api';

const ProfileModal = ({ user, onClose }) => {
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadProfile = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    setError(null);
    
    // Debug: Check if token exists
    const token = localStorage.getItem('jwt') || localStorage.getItem('token');
    console.log('🔍 ProfileModal Debug:', {
      userId: user._id,
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'No token',
      retryCount
    });
    
    try {
      const res = await api.get(`/auth/users/${user._id}`);
      console.log('✅ Profile loaded successfully:', res.data);
      setProfile(res.data.user);
      setLoading(false);
    } catch (err) {
      console.error('❌ Profile load error:', err.response?.data || err.message);
      
      if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
        // Clear invalid tokens
        localStorage.removeItem('jwt');
        localStorage.removeItem('token');
      } else if (err.response?.status === 404) {
        setError('User profile not found.');
      } else {
        setError('Failed to load profile. Please try again.');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-xl">&times;</button>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="loader border-4 border-blue-500 border-t-transparent rounded-full w-10 h-10 animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <div className="space-x-2">
              {error.includes('Authentication required') && (
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Go to Login
                </button>
              )}
              {!error.includes('Authentication required') && (
                <button 
                  onClick={handleRetry}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4">
              <img
                src={profile.avatar || '/avatar.png'}
                alt={profile.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
              />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.username}</h2>
              <div className="text-sm text-gray-500 dark:text-gray-300">{profile.email || 'No email provided'}</div>
            </div>
            <div className="mt-6 space-y-2">
              {profile.city && <div className="text-gray-700 dark:text-gray-200"><b>City:</b> {profile.city}</div>}
              {profile.relationshipStatus && <div className="text-gray-700 dark:text-gray-200"><b>Relationship:</b> {profile.relationshipStatus}</div>}
              {profile.location && <div className="text-gray-700 dark:text-gray-200"><b>Location:</b> {profile.location}</div>}
              {profile.dateOfBirth && <div className="text-gray-700 dark:text-gray-200"><b>Date of Birth:</b> {new Date(profile.dateOfBirth).toLocaleDateString()}</div>}
              {profile.bio && <div className="text-gray-700 dark:text-gray-200"><b>Bio:</b> {profile.bio}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileModal; 