// src/pages/ProfilePage.jsx

import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import { Camera, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();

  const [selectedImg, setSelectedImg] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    city: '',
    relationshipStatus: '',
    bio: '',
    location: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    if (authUser) {
      setFormData({
        username: authUser.username || '',
        email: authUser.email || '',
        city: authUser.city || '',
        relationshipStatus: authUser.relationshipStatus || '',
        bio: authUser.bio || '',
        location: authUser.location || '',
        dateOfBirth: authUser.dateOfBirth ? new Date(authUser.dateOfBirth).toISOString().slice(0, 10) : '',
      });
    }
  }, [authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      setSelectedImg(reader.result);
      try {
        await updateProfile({ avatar: reader.result });
        toast.success('Avatar updated');
      } catch {
        toast.error('Failed to upload image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert date string to proper format for backend
      const dataToSend = { ...formData };
      if (dataToSend.dateOfBirth) {
        dataToSend.dateOfBirth = new Date(dataToSend.dateOfBirth).toISOString();
      }
      
      await updateProfile(dataToSend);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="card p-8 space-y-8 bg-white dark:bg-gray-800 dark:text-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Manage your profile information</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser?.avatar || '/avatar.png'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-full cursor-pointer transition-all duration-200 hover:scale-105 ${
                  isUpdatingProfile ? 'animate-pulse pointer-events-none' : ''
                }`}
              >
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">
              {isUpdatingProfile ? 'Uploading...' : 'Click the camera icon to update your photo'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4" /> Username
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                {authUser?.username || 'N/A'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                {authUser?.email || 'N/A'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-8">

            {[
              { name: 'city', label: 'City' },
              { name: 'relationshipStatus', label: 'Relationship Status' },
              { name: 'location', label: 'Location' },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                  className="mt-1 p-2 w-full border rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="mt-1 p-2 w-full border rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="mt-1 p-2 w-full border rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              {isUpdatingProfile ? 'Updating...' : 'Update Profile Info'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
