import { useChatStore } from '../Store/useChatStore';
import Sidebar from '../components/chat/Sidebar';
import NoChatSelected from '../components/chat/NoChatSelected';
import ChatContainer from '../components/chat/ChatContainer';

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)] mt-4">
        <div className="flex h-full rounded-2xl overflow-hidden">
          <Sidebar />
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;