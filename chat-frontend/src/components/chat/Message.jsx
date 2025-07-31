import { useState } from 'react';
import { useAuthStore } from '../../Store/useAuthStore';
import { useChatStore } from '../../Store/useChatStore';
import AudioPlayer from './AudioPlayer';
import { formatMessageTime } from '../../lib/utils';
import { MoreVertical, Trash2, Pin, PinOff } from 'lucide-react';

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
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2 group relative`}
      onContextMenu={handleContextMenu}
    >
      <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar - only show for received messages */}
        {!isOwnMessage && (
          <img
            src={message.senderId.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(message.senderId.username) + '&background=4A90E2&color=fff'}
            alt={message.senderId.username}
            className="w-8 h-8 rounded-full object-cover"
          />
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {/* Time */}
          <div className={`text-xs text-gray-500 mb-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {formatMessageTime(message.createdAt)}
          </div>

          {/* Message Bubble */}
          <div
            className={`px-4 py-2 rounded-lg max-w-xs lg:max-w-md break-words ${
              isOwnMessage
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
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
                className="max-w-full h-auto rounded mb-2"
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
            {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
          </div>
        </div>

        {/* Avatar - only show for sent messages */}
        {isOwnMessage && (
          <img
            src={message.senderId.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(message.senderId.username) + '&background=4A90E2&color=fff'}
            alt={message.senderId.username}
            className="w-8 h-8 rounded-full object-cover"
          />
        )}

        {/* Context Menu Button */}
        <button
          onClick={handleContextMenu}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 right-0 top-0">
          <button
            onClick={handlePin}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
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
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 flex items-center gap-2"
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