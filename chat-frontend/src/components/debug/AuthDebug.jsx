import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../api';

const AuthDebug = () => {
  const { authUser, checkAuth } = useAuthStore();
  const [debugInfo, setDebugInfo] = useState({});
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt') || localStorage.getItem('token');
    setDebugInfo({
      hasAuthUser: !!authUser,
      authUserId: authUser?._id,
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'No token',
      timestamp: new Date().toISOString()
    });
  }, [authUser]);

  const testAuth = async () => {
    try {
      setTestResult({ loading: true, error: null });
      const res = await api.get('/auth/check');
      setTestResult({ 
        loading: false, 
        success: true, 
        data: res.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setTestResult({ 
        loading: false, 
        success: false, 
        error: error.response?.data || error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  const clearTokens = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('token');
    setDebugInfo(prev => ({ ...prev, hasToken: false, tokenLength: 0, tokenPreview: 'No token' }));
  };

  if (!process.env.NODE_ENV === 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">🔍 Auth Debug</h3>
      
      <div className="text-xs space-y-1 mb-3">
        <div><strong>Auth User:</strong> {debugInfo.hasAuthUser ? 'Yes' : 'No'}</div>
        <div><strong>User ID:</strong> {debugInfo.authUserId || 'None'}</div>
        <div><strong>Token:</strong> {debugInfo.hasToken ? 'Yes' : 'No'}</div>
        <div><strong>Token Length:</strong> {debugInfo.tokenLength}</div>
        <div><strong>Token Preview:</strong> {debugInfo.tokenPreview}</div>
        <div><strong>Time:</strong> {debugInfo.timestamp}</div>
      </div>

      <div className="space-y-2">
        <button 
          onClick={testAuth}
          disabled={testResult?.loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded"
        >
          {testResult?.loading ? 'Testing...' : 'Test Auth'}
        </button>
        
        <button 
          onClick={checkAuth}
          className="w-full bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded"
        >
          Refresh Auth
        </button>
        
        <button 
          onClick={clearTokens}
          className="w-full bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
        >
          Clear Tokens
        </button>
      </div>

      {testResult && (
        <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
          <div><strong>Test Result:</strong></div>
          <div><strong>Success:</strong> {testResult.success ? 'Yes' : 'No'}</div>
          {testResult.error && (
            <div><strong>Error:</strong> {JSON.stringify(testResult.error)}</div>
          )}
          {testResult.data && (
            <div><strong>Data:</strong> {JSON.stringify(testResult.data)}</div>
          )}
          <div><strong>Time:</strong> {testResult.timestamp}</div>
        </div>
      )}
    </div>
  );
};

export default AuthDebug; 