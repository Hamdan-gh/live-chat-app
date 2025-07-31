// Utility function to convert audio blob to data URL with proper MIME type
export const convertAudioBlobToDataURL = async (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Utility function to get audio MIME type for better compatibility
export const getAudioMimeType = () => {
  // Try the most compatible formats first
  const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/wav'
  ];
  
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      console.log('Using audio MIME type:', mimeType);
      return mimeType;
    }
  }
  
  console.log('No supported MIME type found, using default');
  return 'audio/webm'; // fallback
};

// Utility function to validate audio blob
export const validateAudioBlob = (blob) => {
  if (!blob || blob.size === 0) {
    return { isValid: false, error: 'Audio recording is empty' };
  }
  
  if (blob.size > 10 * 1024 * 1024) { // 10MB limit
    return { isValid: false, error: 'Audio file is too large (max 10MB)' };
  }
  
  const validTypes = ['audio/webm', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg', 'audio/wav'];
  if (!validTypes.includes(blob.type)) {
    return { isValid: false, error: 'Unsupported audio format' };
  }
  
  return { isValid: true };
};

// Test function to validate base64 audio data
export const testAudioData = (base64Data) => {
  try {
    console.log('=== AUDIO VALIDATION DEBUG ===');
    console.log('Testing audio data:', {
      length: base64Data.length,
      startsWith: base64Data.substring(0, 50),
      fullData: base64Data.substring(0, 100) + '...'
    });
    
    // Check if it's a valid data URL
    if (!base64Data.startsWith('data:')) {
      console.log('❌ Failed: Not a data URL');
      return { isValid: false, error: 'Invalid data URL format - must start with "data:"' };
    }
    
    // Extract MIME type
    const mimeMatch = base64Data.match(/^data:([^;]+);base64,/);
    if (!mimeMatch) {
      console.log('❌ Failed: Could not extract MIME type');
      return { isValid: false, error: 'Invalid MIME type format' };
    }
    
    const mimeType = mimeMatch[1];
    console.log('✅ Extracted MIME type:', mimeType);
    
    // Check if it's an audio MIME type - VERY LENIENT
    if (!mimeType.startsWith('audio/')) {
      console.log('❌ Failed: Not an audio MIME type:', mimeType);
      return { isValid: false, error: `Not an audio MIME type: ${mimeType}` };
    }
    
    console.log('✅ Valid audio MIME type:', mimeType);
    
    // Check data length
    const dataLength = base64Data.length;
    console.log('✅ Audio data length:', dataLength);
    
    if (dataLength < 100) {
      console.log('❌ Failed: Data too short');
      return { isValid: false, error: 'Audio data too short (minimum 100 characters)' };
    }
    
    console.log('✅ Audio validation passed!');
    console.log('=== END AUDIO VALIDATION DEBUG ===');
    return { isValid: true, mimeType, dataLength };
  } catch (error) {
    console.error('❌ Error in testAudioData:', error);
    console.log('=== END AUDIO VALIDATION DEBUG ===');
    return { isValid: false, error: error.message };
  }
};

// Debug function to test audio recording capabilities
export const debugAudioCapabilities = () => {
  console.log('=== Audio Capabilities Debug ===');
  
  // Check MediaRecorder support
  console.log('MediaRecorder supported:', typeof MediaRecorder !== 'undefined');
  
  if (typeof MediaRecorder !== 'undefined') {
    // Test different MIME types
    const testMimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4;codecs=mp4a.40.2',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/wav'
    ];
    
    console.log('Supported MIME types:');
    testMimeTypes.forEach(mimeType => {
      const supported = MediaRecorder.isTypeSupported(mimeType);
      console.log(`  ${mimeType}: ${supported}`);
    });
  }
  
  // Check getUserMedia support
  console.log('getUserMedia supported:', typeof navigator.mediaDevices?.getUserMedia !== 'undefined');
  
  console.log('=== End Audio Debug ===');
}; 