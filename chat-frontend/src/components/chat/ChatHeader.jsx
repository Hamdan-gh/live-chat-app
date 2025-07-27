import { useChatStore } from '../../Store/useChatStore';
import { useAuthStore } from '../../Store/useAuthStore';
import { X, Phone, Video, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import ProfileModal from '../profile/ProfileModal';

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative cursor-pointer" onClick={() => setShowProfile(true)}>
          <img
            src={selectedUser?.avatar || '/avatar.png'}
            alt={selectedUser?.username || 'User'}
            className="w-10 h-10 object-cover rounded-full"
          />
          {selectedUser?._id && onlineUsers.includes(selectedUser._id) && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
          )}
        </div>

        {/* User Info */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{selectedUser?.username || 'User'}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {selectedUser?._id && onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Phone className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Video className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={() => setSelectedUser(null)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal user={selectedUser} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default ChatHeader;