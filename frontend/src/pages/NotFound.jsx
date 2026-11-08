import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <span className="font-serif text-7xl font-bold text-ink-light mb-4">404</span>
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-2">
        Story not found
      </h1>
      <p className="text-sm text-ink-muted max-w-md mb-8 leading-relaxed">
        The page or story you are looking for may have moved, been unpublished, or does not exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-5 py-2.5 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded-full transition shadow-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
