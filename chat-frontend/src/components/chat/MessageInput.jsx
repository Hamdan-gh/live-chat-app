import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore.js';
import { Image, Send, Smile, X, Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { convertAudioBlobToDataURL, getAudioMimeType, validateAudioBlob, testAudioData, debugAudioCapabilities } from '../../lib/audioUtils.js';

// Emoji data - common emojis
const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
  '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '👽',
  '🤖', '😈', '👿', '👹', '👺', '💀', '☠️', '👻', '👽', '🤖',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
  '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
  '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
  '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
  '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️',
  '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️',
  '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️',
  '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓',
  '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️',
  '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠',
  'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🛂', '🛃',
  '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁',
  '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕',
  '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣',
  '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️',
  '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽',
  '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️',
  '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '➿',
  '✳️', '❇️', '🔰', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹',
  '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾',
  '♿', '🅿️', '🛗', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼',
  '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠',
  '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣',
  '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣'
];

const MessageInput = () => {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const { sendMessage } = useChatStore();

  // Debug audio capabilities on component mount
  useEffect(() => {
    debugAudioCapabilities();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addEmoji = (emoji) => {
    setText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Use utility function to get the best supported audio format
      const mimeType = getAudioMimeType();
      const options = { mimeType };
      
      // Fallback if the preferred format is not supported
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        options.mimeType = 'audio/webm';
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        // Create blob with proper MIME type
        let finalMimeType = mediaRecorderRef.current.mimeType || mimeType;
        
        // Fallback if MIME type is empty or invalid
        if (!finalMimeType || finalMimeType === '') {
          finalMimeType = 'audio/webm';
        }
        
        const blob = new Blob(chunks, { type: finalMimeType });
        console.log('Audio recording completed:', {
          size: blob.size,
          type: blob.type,
          mimeType: finalMimeType,
          chunksLength: chunks.length,
          recorderMimeType: mediaRecorderRef.current.mimeType
        });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Auto-stop recording after 5 minutes
          if (newTime >= 300) {
            stopRecording();
            toast.info('Recording stopped automatically (5 minute limit)');
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioBlob(null);
      setRecordingTime(0);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !audioBlob) return;

    setIsUploading(true);
    try {
      let audioData = null;
      if (audioBlob) {
        // Validate audio blob before sending
        const validation = validateAudioBlob(audioBlob);
        if (!validation.isValid) {
          toast.error(validation.error);
          setIsUploading(false);
          return;
        }

        // Convert blob to base64 for storage using utility function
        console.log('Converting audio blob to data URL:', {
          blobSize: audioBlob.size,
          blobType: audioBlob.type
        });
        
        audioData = await convertAudioBlobToDataURL(audioBlob);
        console.log('Audio data URL created:', {
          dataLength: audioData.length,
          dataStart: audioData.substring(0, 50)
        });
        
        // Test the audio data
        const testResult = testAudioData(audioData);
        console.log('Audio data test result:', testResult);
        
        // TEMPORARY: Skip validation to test if audio works without it
        if (!testResult.isValid) {
          console.log('⚠️ Audio validation failed, but continuing anyway for testing...');
          console.log('Error was:', testResult.error);
          // Uncomment the next 3 lines to re-enable validation
          // toast.error(`Audio validation failed: ${testResult.error}`);
          // setIsUploading(false);
          // return;
        }
        
        console.log('Audio data prepared for sending:', {
          size: audioData.length,
          startsWith: audioData.substring(0, 50),
          mimeType: testResult.mimeType
        });
      }

      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        audio: audioData, // Send base64 audio data
      });

      // Clear form
      setText('');
      setImagePreview(null);
      setAudioBlob(null);
      setRecordingTime(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-500 hover:bg-gray-600 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Image ready to send</span>
        </div>
      )}

      {/* Audio Preview */}
      {audioBlob && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <audio controls className="w-64 h-12">
              <source src={URL.createObjectURL(audioBlob)} type={audioBlob.type} />
              Your browser does not support the audio element.
            </audio>
            <button
              onClick={() => setAudioBlob(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-500 hover:bg-gray-600 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Voice message ready to send</span>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 max-h-60 overflow-y-auto z-50">
          <div className="grid grid-cols-8 gap-1">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => addEmoji(emoji)}
                className="w-8 h-8 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative">
        {/* File Upload */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        {/* Image Button */}
        <button
          type="button"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isRecording}
        >
          <Image className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Voice Recording Button */}
        <button
          type="button"
          className={`p-2 rounded-lg transition-colors ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isUploading}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Recording Timer */}
        {isRecording && (
          <div className="flex items-center gap-2 text-red-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
            <button
              type="button"
              onClick={cancelRecording}
              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Text Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            className="input pr-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isUploading || isRecording}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isUploading || isRecording}
          >
            <Smile className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className="btn btn-primary p-2"
          disabled={(!text.trim() && !imagePreview && !audioBlob) || isUploading || isRecording}
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
