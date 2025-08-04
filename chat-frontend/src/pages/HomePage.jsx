import { useState, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore.js';
import Sidebar from '../components/chat/Sidebar.jsx';
import NoChatSelected from '../components/chat/NoChatSelected.jsx';
import ChatContainer from '../components/chat/ChatContainer.jsx';
import ChatHeader from '../components/chat/ChatHeader.jsx';
import { Menu, X } from 'lucide-react';

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when a user is selected on mobile
  useEffect(() => {
    if (selectedUser && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [selectedUser]);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 pt-16">
      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          {selectedUser && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={selectedUser.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedUser.username) + '&background=4A90E2&color=fff'}
                  alt={selectedUser.username}
                  className="w-8 h-8 object-cover rounded-full"
                />
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                  selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {selectedUser.username}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedUser.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          )}
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Mobile Sidebar Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chats</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          <Sidebar />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Desktop Chat Header */}
        <div className="hidden lg:block">
          <ChatHeader />
        </div>
        
        {/* Chat Container */}
        <div className="flex-1 overflow-hidden pt-16 lg:pt-0">
          {!selectedUser ? <NoChatSelected /> : <ChatContainer selectedUser={selectedUser} />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;