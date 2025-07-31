import { useChatStore } from '../Store/useChatStore.js';
import Sidebar from '../components/chat/Sidebar.jsx';
import NoChatSelected from '../components/chat/NoChatSelected.jsx';
import ChatContainer from '../components/chat/ChatContainer.jsx';
import ChatHeader from '../components/chat/ChatHeader.jsx';

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl h-[calc(100vh-6rem)]">
        <div className="flex h-full rounded-2xl overflow-hidden">
          {/* Sidebar - Always visible on desktop, can be toggled on mobile */}
          <div className="w-80 lg:block">
            <Sidebar />
          </div>
          
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatHeader />
            <div className="flex-1 overflow-hidden">
              {!selectedUser ? <NoChatSelected /> : <ChatContainer selectedUser={selectedUser} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;