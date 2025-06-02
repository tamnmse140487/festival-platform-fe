import React from 'react';

const LoadingSpinner = ({ size = 'large', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className={`${sizeClasses[size]} ${className} animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto`}></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;