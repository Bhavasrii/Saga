import React from 'react';

export const LoadingSpinner = ({ text = 'Loading stories...' }) => {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center">
      <div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm text-ink-muted">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
