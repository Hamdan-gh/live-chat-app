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
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-white dark:bg-gray-900 max-h-[60vh]">
        {messages.map((message) => (
          <Message key={message._id} message={message} />
        ))}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

// Message skeleton loader
const MessageSkeleton = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
      {[...Array(6)].map((_, i) => {
        const isOwnMessage = i % 2 === 1;
        return (
          <div key={i} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
            <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar - only show for received messages */}
              {!isOwnMessage && (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
              )}
              
              <div className="flex flex-col">
                <div className={`w-12 h-3 bg-gray-200 rounded animate-pulse mb-2 ${isOwnMessage ? 'ml-auto' : ''}`} />
                <div
                  className={`w-32 h-8 bg-gray-200 rounded-2xl animate-pulse ${
                    isOwnMessage ? 'bg-blue-200' : 'bg-gray-200'
                  }`}
                />
              </div>

              {/* Avatar - only show for sent messages */}
              {isOwnMessage && (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatContainer;