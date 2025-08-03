import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'https://live-chat-app-vw20.onrender.com/api/auth';

const ProfileModal = ({ user, onClose }) => {
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);
    axios.get(`${API_BASE}/users/${user._id}`, { withCredentials: true })
      .then(res => {
        setProfile(res.data.user);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load profile');
        setLoading(false);
      });
  }, [user]);

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
          <div className="text-red-500 text-center">{error}</div>
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