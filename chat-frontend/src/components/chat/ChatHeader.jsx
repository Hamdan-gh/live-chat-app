import { useChatStore } from '../../Store/useChatStore';
import { MoreVertical, Phone, Video } from 'lucide-react';
import { useState } from 'react';
import OnlineStatusIndicator from './OnlineStatusIndicator';
import ProfileModal from '../profile/ProfileModal';

const ChatHeader = () => {
  const { selectedUser } = useChatStore();
  const [showProfile, setShowProfile] = useState(false);

  if (!selectedUser) {
    return (
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-center h-16">
          <p className="text-gray-500 dark:text-gray-400">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer" onClick={() => setShowProfile(true)}>
            <img
              src={selectedUser.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedUser.username) + '&background=4A90E2&color=fff'}
              alt={selectedUser.username}
              className="w-10 h-10 object-cover rounded-full"
            />
            <OnlineStatusIndicator isOnline={selectedUser.isOnline} size="md" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {selectedUser.username}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedUser.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Phone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Video className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal user={selectedUser} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default ChatHeader;