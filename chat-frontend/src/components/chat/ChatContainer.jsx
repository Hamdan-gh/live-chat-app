import { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore.js';
import MessageInput from './MessageInput.jsx';
import Message from './Message.jsx';

const ChatContainer = ({ selectedUser }) => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 max-h-[60vh] relative">
        {/* Chat background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Welcome message for new chats */}
        {messages.length === 0 && selectedUser && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">👋</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Start a conversation with {selectedUser.username}</h3>
            <p className="text-sm">Send a message to begin chatting!</p>
          </div>
        )}

        {/* Messages */}
        <div className="relative z-10">
          {messages.map((message, index) => (
            <Message key={message._id} message={message} />
          ))}
        </div>
        
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

// Message skeleton loader
const MessageSkeleton = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {[...Array(6)].map((_, i) => {
        const isOwnMessage = i % 2 === 1;
        return (
          <div key={i} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`flex items-end gap-2 max-w-xs lg:max-w-md xl:max-w-lg ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar - only show for received messages */}
              {!isOwnMessage && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse border-2 border-gray-200 dark:border-gray-600" />
                </div>
              )}
              
              <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-full`}>
                {/* Sender name skeleton for received messages */}
                {!isOwnMessage && (
                  <div className="w-16 h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1 ml-1" />
                )}
                
                <div
                  className={`px-4 py-2 rounded-2xl max-w-full animate-pulse shadow-sm ${
                    isOwnMessage 
                      ? 'bg-blue-200 dark:bg-blue-800 rounded-br-md' 
                      : 'bg-gray-200 dark:bg-gray-600 rounded-bl-md'
                  }`}
                >
                  <div className={`w-32 h-4 bg-gray-300 dark:bg-gray-500 rounded animate-pulse mb-2`} />
                  <div className={`w-24 h-3 bg-gray-300 dark:bg-gray-500 rounded animate-pulse`} />
                </div>
              </div>

              {/* Avatar - only show for sent messages */}
              {isOwnMessage && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse border-2 border-blue-200" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatContainer;