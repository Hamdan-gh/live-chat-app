import React from 'react';

const OnlineStatusIndicator = ({ isOnline, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const ringClasses = {
    sm: 'ring-1',
    md: 'ring-2',
    lg: 'ring-2'
  };

  return (
    <div className="relative">
      {isOnline && (
        <span 
          className={`absolute bottom-0 right-0 ${sizeClasses[size]} bg-green-500 rounded-full ${ringClasses[size]} ring-white dark:ring-gray-800 animate-pulse`}
          title="Online"
        />
      )}
    </div>
  );
};

export default OnlineStatusIndicator; 