import { useChatStore } from '../../Store/useChatStore';
import { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import { useAuthStore } from '../../Store/useAuthStore';
import { formatMessageTime } from '../../lib/utils';

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${message.senderId === authUser?._id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex gap-3 max-w-xs lg:max-w-md ${
                message.senderId === authUser?._id ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                <img
                  src={
                    message.senderId === authUser?._id
                      ? authUser?.profilePic || '/avatar.png'
                      : selectedUser?.profilePic || '/avatar.png'
                  }
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Message Content */}
              <div
                className={`flex flex-col ${
                  message.senderId === authUser?._id ? 'items-end' : 'items-start'
                }`}
              >
                {/* Time */}
                <div className="text-xs text-gray-500 mb-1">
                  {formatMessageTime(message.createdAt)}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-2 max-w-xs lg:max-w-md ${
                    message.senderId === authUser?._id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="max-w-full rounded-lg mb-2"
                    />
                  )}
                  {message.text && <p className="text-sm">{message.text}</p>}
                </div>
              </div>
            </div>
          </div>
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
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div
            className={`flex gap-3 max-w-xs lg:max-w-md ${
              i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
            }`}
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
            <div className="flex flex-col">
              <div className="w-12 h-3 bg-gray-200 rounded animate-pulse mb-2" />
              <div
                className={`w-32 h-8 bg-gray-200 rounded-2xl animate-pulse ${
                  i % 2 === 0 ? '' : 'ml-auto'
                }`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatContainer;