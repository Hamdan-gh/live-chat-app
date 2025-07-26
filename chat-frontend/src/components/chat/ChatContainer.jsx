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

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {messages.map((message) => {
          const isOwnMessage = message.senderId._id === authUser?._id;
          return (
            <div
              key={message._id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar - only show for received messages */}
                {!isOwnMessage && (
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                    <img
                      src={message.senderId.avatar || '/avatar.png'}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Message Content */}
                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {/* Time */}
                  <div className={`text-xs text-gray-500 mb-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                    {formatMessageTime(message.createdAt)}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2 max-w-xs lg:max-w-md break-words ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
                    }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="max-w-full rounded-lg mb-2"
                      />
                    )}
                    {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
                  </div>
                </div>

                {/* Avatar - only show for sent messages */}
                {isOwnMessage && (
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                    <img
                      src={message.senderId.avatar || '/avatar.png'}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
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