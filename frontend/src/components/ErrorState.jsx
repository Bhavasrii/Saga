import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorState = ({
  message = 'Something went wrong. Please try again.',
  onRetry = null,
}) => {
  return (
    <div className="py-16 px-4 text-center max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-lg font-bold text-ink mb-1">
        Unable to load content
      </h3>
      <p className="text-sm text-ink-muted mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center px-4 py-2 border border-borderWarm text-sm font-medium rounded-md text-ink bg-white hover:bg-stone-50 transition"
        >
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
