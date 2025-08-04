import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useChatStore } from '../../store/useChatStore.js';
import AudioPlayer from './AudioPlayer.jsx';
import { formatMessageTime } from '../../lib/utils.js';
import { MoreVertical, Trash2, Pin, PinOff, Check, CheckCheck } from 'lucide-react';

const Message = ({ message }) => {
  const { authUser } = useAuthStore();
  const { deleteMessage, pinMessage, unpinMessage } = useChatStore();
  const [showContextMenu, setShowContextMenu] = useState(false);
  
  const isOwnMessage = message.senderId._id === authUser?._id;

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowContextMenu(true);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(message._id);
    }
    setShowContextMenu(false);
  };

  const handlePin = async () => {
    if (message.isPinned) {
      await unpinMessage(message._id);
    } else {
      await pinMessage(message._id);
    }
    setShowContextMenu(false);
  };

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3 group relative`}
      onContextMenu={handleContextMenu}
    >
      <div className={`flex items-end gap-2 max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar - only show for received messages */}
        {!isOwnMessage && (
          <div className="flex-shrink-0">
            <img
              src={message.senderId.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(message.senderId.username) + '&background=4A90E2&color=fff'}
              alt={message.senderId.username}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
            />
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-full`}>
          {/* Sender name for received messages */}
          {!isOwnMessage && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1 font-medium">
              {message.senderId.username}
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`relative px-3 py-2 sm:px-4 sm:py-2 rounded-2xl max-w-full break-words shadow-sm ${
              isOwnMessage
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
            } ${message.isPinned ? 'border-l-4 border-yellow-500' : ''}`}
          >
            {/* Pinned indicator */}
            {message.isPinned && (
              <div className="flex items-center gap-1 mb-1 text-xs opacity-75">
                <Pin className="w-3 h-3" />
                <span>Pinned</span>
              </div>
            )}

            {/* Image */}
            {message.imageUrl && (
              <img
                src={message.imageUrl}
                alt=""
                className="max-w-full h-auto rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.imageUrl, '_blank')}
              />
            )}

            {/* Audio */}
            {message.audioUrl && (
              <AudioPlayer
                audioData={message.audioUrl}
                messageId={message._id}
              />
            )}

            {/* Text */}
            {message.text && (
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.text}
              </p>
            )}

            {/* Message status and time */}
            <div className={`flex items-center justify-end gap-1 mt-1 text-xs opacity-75 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
              <span>{formatMessageTime(message.createdAt)}</span>
              {isOwnMessage && (
                <div className="flex items-center">
                  {message.isRead ? (
                    <CheckCheck className="w-3 h-3 text-blue-200" />
                  ) : (
                    <Check className="w-3 h-3 text-blue-200" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Avatar - only show for sent messages */}
        {isOwnMessage && (
          <div className="flex-shrink-0">
            <img
              src={message.senderId.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(message.senderId.username) + '&background=4A90E2&color=fff'}
              alt={message.senderId.username}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-blue-200"
            />
          </div>
        )}

        {/* Context Menu Button */}
        <button
          onClick={handleContextMenu}
          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full touch-manipulation ${
            isOwnMessage ? 'order-first' : 'order-last'
          }`}
        >
          <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div className={`absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 ${
          isOwnMessage ? 'right-0' : 'left-0'
        } top-0 min-w-[120px]`}>
          <button
            onClick={handlePin}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm touch-manipulation"
          >
            {message.isPinned ? (
              <>
                <PinOff className="w-4 h-4" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="w-4 h-4" />
                Pin
              </>
            )}
          </button>
          {isOwnMessage && (
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 flex items-center gap-2 text-sm touch-manipulation"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      )}

      {/* Overlay to close context menu */}
      {showContextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowContextMenu(false)}
        />
      )}
    </div>
  );
};

export default Message; 
