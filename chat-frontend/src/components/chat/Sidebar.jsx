import { useEffect, useState } from 'react';
import { useChatStore } from '../../Store/useChatStore';
import { useAuthStore } from '../../Store/useAuthStore';
import { Users, Search } from 'lucide-react';

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOnlineFilter = showOnlineOnly ? onlineUsers.includes(user._id) : true;
    return matchesSearch && matchesOnlineFilter;
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="mt-30 border-b border-gray-200 p-5 ">
        <div className="flex items-center gap-2 ">
          <Users className="w-6 h-6 text-gray-600" />
          <span className="font-semibold text-gray-900 hidden lg:block">Conversations</span>
        </div>

        {/* Search */}
        <div className="mt-4 hidden lg:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10 text-sm"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Online Filter */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Show online only</span>
          </label>
          <span className="text-xs text-gray-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      {/* Users List */}
      <div className="overflow-y-auto flex-1 py-3 custom-scrollbar">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
              selectedUser?._id === user._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || '/avatar.png'}
                alt={user.username}
                className="w-12 h-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="font-medium truncate text-gray-900">{user.username}</div>
              <div className="text-sm text-gray-500">
                {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>{searchTerm ? 'No users found' : 'No contacts yet'}</p>
          </div>
        )}
      </div>
    </aside>
  );
};

// Skeleton loader component
const SidebarSkeleton = () => {
  return (
    <aside className="h-full w-20 lg:w-80 border-r border-gray-200 flex flex-col">
      <div className="border-b border-gray-200 p-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse hidden lg:block" />
        </div>
      </div>
      <div className="overflow-y-auto flex-1 py-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-full p-3 flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse mx-auto lg:mx-0" />
            <div className="hidden lg:block flex-1">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;