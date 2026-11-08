import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-borderWarm bg-white/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="font-serif text-xl font-bold text-ink">Saga</span>
          <p className="text-xs text-ink-muted mt-1">Stories worth telling.</p>
        </div>

        <nav className="flex items-center space-x-6 text-xs text-ink-muted">
          <Link to="/" className="hover:text-forest transition">
            Home
          </Link>
          <Link to="/stories" className="hover:text-forest transition">
            Stories
          </Link>
          <Link to="/stories" className="hover:text-forest transition">
            Topics
          </Link>
        </nav>

        <p className="text-xs text-ink-light">
          &copy; {new Date().getFullYear()} Saga. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
