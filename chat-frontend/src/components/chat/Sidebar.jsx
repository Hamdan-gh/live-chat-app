import { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { Users, Search } from 'lucide-react';

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, searchUsers, searchResults } = useChatStore();
  const { authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Live search effect
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (searchTerm) {
      searchTimeout.current = setTimeout(() => {
        searchUsers(searchTerm);
        setShowDropdown(true);
      }, 200);
    } else {
      setShowDropdown(false);
    }
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm, searchUsers]);

  // Filter users by online status and exclude current user
  const filteredUsers = users.filter((user) => {
    const isOnline = user.isOnline;
    const isCurrentUser = user._id === authUser?._id;
    return !isCurrentUser && (showOnlineOnly ? isOnline : true);
  });

  // Count online users (excluding current user)
  const onlineUsersCount = users.filter(user => 
    user.isOnline && user._id !== authUser?._id
  ).length;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="w-full h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 lg:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">Conversations</span>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-3 py-2 sm:py-3 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
          </div>
          {/* Search Results Dropdown */}
          {showDropdown && searchTerm && searchResults.length > 0 && (
            <div className="absolute z-10 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user);
                    setSearchTerm('');
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
                >
                  <div className="relative">
                    <img
                      src={user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username) + '&background=4A90E2&color=fff'}
                      alt={user.username}
                      className="w-10 h-10 object-cover rounded-full"
                    />
                    {user.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium truncate text-gray-900 dark:text-gray-100">{user.username}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user.isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </button>
              ))}
              {searchResults.length === 0 && (
                <div className="px-4 py-3 text-gray-500 dark:text-gray-400">No users found</div>
              )}
            </div>
          )}
        </div>

        {/* Online Filter */}
        <div className="mt-3 flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2 touch-manipulation">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-200">Show online only</span>
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">({onlineUsersCount} online)</span>
        </div>
      </div>

      {/* Users List */}
      <div className="overflow-y-auto flex-1 py-2 custom-scrollbar scroll-smooth">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full p-3 sm:p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation ${
              selectedUser?._id === user._id ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
            }`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username) + '&background=4A90E2&color=fff'}
                alt={user.username}
                className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-full"
              />
              {user.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
              )}
            </div>

            {/* User info */}
            <div className="text-left min-w-0 flex-1">
              <div className="font-medium truncate text-gray-900 dark:text-gray-100 text-sm sm:text-base">{user.username}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {user.isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 px-4">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="dark:text-gray-100 text-sm sm:text-base">
              {showOnlineOnly ? 'No online contacts' : 'No contacts yet'}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

// Skeleton loader component
const SidebarSkeleton = () => {
  return (
    <aside className="h-full w-full border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 lg:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
        </div>
        <div className="w-full h-10 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse mb-3" />
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
          <div className="w-20 h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
        </div>
      </div>
      <div className="overflow-y-auto flex-1 py-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-full p-3 sm:p-4 flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse flex-shrink-0" />
            <div className="flex-1">
              <div className="w-24 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2" />
              <div className="w-16 h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
