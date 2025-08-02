import React, { useState } from 'react';
import { useChatStore } from '../../store/useChatStore.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { Wifi, WifiOff, RefreshCw, TestTube } from 'lucide-react';

const SocketStatus = () => {
  const { isConnected, socket, connectSocket, disconnectSocket } = useChatStore();
  const { authUser } = useAuthStore();
  const [showDetails, setShowDetails] = useState(false);
  const [testResult, setTestResult] = useState('');

  // Helper function to get JWT token from cookies
  const getTokenFromCookies = () => {
    const cookies = document.cookie.split(';');
    const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
    return jwtCookie ? jwtCookie.split('=')[1] : null;
  };

  const handleReconnect = () => {
    if (authUser) {
      const token = getTokenFromCookies();
      if (token) {
        disconnectSocket();
        setTimeout(() => {
          connectSocket(authUser._id, token);
        }, 1000);
      }
    }
  };

  const testConnection = async () => {
    setTestResult('Testing...');
    try {
      // Test backend connectivity
      const response = await fetch('https://live-chat-app-vw20.onrender.com/');
      const healthData = await response.json();
      
      // Test online users endpoint
      const onlineResponse = await fetch('https://live-chat-app-vw20.onrender.com/');
      const onlineData = await onlineResponse.json();
      
      setTestResult(`Backend: ${healthData.status}\nDatabase: ${healthData.database}\nSocket Connections: ${healthData.socketConnections}\nOnline Users: ${onlineData.totalOnline}`);
    } catch (error) {
      setTestResult(`Backend Error: ${error.message}`);
    }
  };

  if (!authUser) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className={`px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer transition-all ${
          isConnected 
            ? 'bg-green-500 text-white hover:bg-green-600' 
            : 'bg-red-500 text-white hover:bg-red-600'
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm">Disconnected</span>
          </>
        )}
      </div>

      {/* Detailed status panel */}
      {showDetails && (
        <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-64">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Socket Status</span>
              <div className="flex gap-1">
                <button
                  onClick={handleReconnect}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Reconnect"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={testConnection}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Test Connection"
                >
                  <TestTube className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Connection:</span>
                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">User:</span>
                <span className="text-gray-900 dark:text-gray-100">{authUser.username}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Socket ID:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {socket?.id || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Token:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {getTokenFromCookies() ? 'Present' : 'Missing'}
                </span>
              </div>

              {testResult && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Test Result:</span>
                  <div className="text-gray-900 dark:text-gray-100">{testResult}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocketStatus; 
