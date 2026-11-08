import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  PenLine,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  FolderTree,
  Tag,
  Image,
  MessageSquare,
  Users,
  BarChart3,
  LogOut,
  User,
} from 'lucide-react';

const roleLabels = {
  admin: 'Admin',
  editor: 'Editor',
  author: 'Writer',
  reader: 'Reader',
};

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editorialOpen, setEditorialOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isWriter = user && ['author', 'editor', 'admin'].includes(user.role);
  const isEditor = user && ['editor', 'admin'].includes(user.role);
  const isAdmin = user && user.role === 'admin';

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-none border-b border-borderWarm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Logo & Core navigation */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-serif text-2xl font-bold tracking-tight text-ink">
              Saga
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm">
            <Link
              to="/"
              className={`transition hover:text-forest ${
                isActive('/') ? 'text-forest font-semibold' : 'text-ink-muted'
              }`}
            >
              Home
            </Link>
            <Link
              to="/stories"
              className={`transition hover:text-forest ${
                isActive('/stories') ? 'text-forest font-semibold' : 'text-ink-muted'
              }`}
            >
              Stories
            </Link>

            {/* Writer links */}
            {isWriter && (
              <Link
                to="/your-stories"
                className={`transition hover:text-forest ${
                  isActive('/your-stories')
                    ? 'text-forest font-semibold'
                    : 'text-ink-muted'
                }`}
              >
                Your stories
              </Link>
            )}

            {/* Editor links */}
            {isEditor && (
              <>
                <Link
                  to="/all-stories"
                  className={`transition hover:text-forest ${
                    isActive('/all-stories')
                      ? 'text-forest font-semibold'
                      : 'text-ink-muted'
                  }`}
                >
                  All stories
                </Link>

                {/* Editorial Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setEditorialOpen(!editorialOpen)}
                    onBlur={() => setTimeout(() => setEditorialOpen(false), 200)}
                    className="flex items-center space-x-1 text-ink-muted hover:text-forest transition"
                  >
                    <span>Editorial</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {editorialOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-borderWarm py-1 z-50">
                      <Link
                        to="/editorial/topics"
                        className="flex items-center px-4 py-2 text-xs text-ink hover:bg-stone-50"
                        onClick={() => setEditorialOpen(false)}
                      >
                        <FolderTree className="w-3.5 h-3.5 mr-2 text-forest" />
                        Topics
                      </Link>
                      <Link
                        to="/editorial/tags"
                        className="flex items-center px-4 py-2 text-xs text-ink hover:bg-stone-50"
                        onClick={() => setEditorialOpen(false)}
                      >
                        <Tag className="w-3.5 h-3.5 mr-2 text-forest" />
                        Tags
                      </Link>
                      <Link
                        to="/editorial/media"
                        className="flex items-center px-4 py-2 text-xs text-ink hover:bg-stone-50"
                        onClick={() => setEditorialOpen(false)}
                      >
                        <Image className="w-3.5 h-3.5 mr-2 text-forest" />
                        Media library
                      </Link>
                      <Link
                        to="/editorial/comments"
                        className="flex items-center px-4 py-2 text-xs text-ink hover:bg-stone-50"
                        onClick={() => setEditorialOpen(false)}
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-2 text-forest" />
                        Review comments
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Admin only links */}
            {isAdmin && (
              <>
                <Link
                  to="/insights"
                  className={`flex items-center transition hover:text-forest ${
                    isActive('/insights')
                      ? 'text-forest font-semibold'
                      : 'text-ink-muted'
                  }`}
                >
                  Insights
                </Link>
                <Link
                  to="/members"
                  className={`flex items-center transition hover:text-forest ${
                    isActive('/members')
                      ? 'text-forest font-semibold'
                      : 'text-ink-muted'
                  }`}
                >
                  Members
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right: Actions & User menu */}
        <div className="flex items-center space-x-4">
          {/* Write Button for Writer / Editor / Admin */}
          {isWriter && (
            <Link
              to="/write"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-forest-tint text-forest border border-forest-light hover:bg-forest hover:text-white transition duration-150"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Write</span>
            </Link>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                onBlur={() => setTimeout(() => setUserDropdownOpen(false), 200)}
                className="flex items-center space-x-2 text-sm focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-forest text-white font-medium flex items-center justify-center text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-medium text-ink truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-ink-muted">
                    [{roleLabels[user.role] || user.role}]
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-ink-muted" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-borderWarm py-1 z-50">
                  <div className="px-4 py-2 border-b border-borderWarm/60">
                    <p className="text-xs font-semibold text-ink truncate">{user.name}</p>
                    <p className="text-[11px] text-ink-muted truncate">{user.email}</p>
                    <div className="mt-1">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                        {roleLabels[user.role] || user.role}
                      </span>
                    </div>
                  </div>

                  {isWriter && (
                    <Link
                      to="/your-stories"
                      className="flex items-center px-4 py-2 text-xs text-ink hover:bg-stone-50"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <BookOpen className="w-3.5 h-3.5 mr-2 text-ink-muted" />
                      Your stories
                    </Link>
                  )}

                  {isEditor && (
                    <Link
                      to="/insights"
                      className="flex items-center px-4 py-2 text-xs text-ink hover:bg-stone-50"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <BarChart3 className="w-3.5 h-3.5 mr-2 text-ink-muted" />
                      Insights
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3 text-sm">
              <Link
                to="/sign-in"
                className="text-xs font-medium text-ink-muted hover:text-ink transition"
              >
                Sign in
              </Link>
              <Link
                to="/sign-up"
                className="px-3 py-1.5 rounded text-xs font-medium text-white bg-forest hover:bg-forest-hover transition duration-150"
              >
                Get started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-ink p-1 rounded hover:bg-stone-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-borderWarm bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-1.5 text-ink hover:text-forest"
          >
            Home
          </Link>
          <Link
            to="/stories"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-1.5 text-ink hover:text-forest"
          >
            Stories
          </Link>

          {isWriter && (
            <Link
              to="/your-stories"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm py-1.5 text-ink hover:text-forest"
            >
              Your stories
            </Link>
          )}

          {isEditor && (
            <>
              <Link
                to="/all-stories"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm py-1.5 text-ink hover:text-forest"
              >
                All stories
              </Link>
              <Link
                to="/editorial/topics"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm py-1.5 text-ink hover:text-forest"
              >
                Topics
              </Link>
              <Link
                to="/editorial/tags"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm py-1.5 text-ink hover:text-forest"
              >
                Tags
              </Link>
              <Link
                to="/editorial/media"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm py-1.5 text-ink hover:text-forest"
              >
                Media library
              </Link>
              <Link
                to="/editorial/comments"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm py-1.5 text-ink hover:text-forest"
              >
                Review comments
              </Link>
              <Link
                to="/insights"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm py-1.5 text-ink hover:text-forest"
              >
                Insights
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/members"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm py-1.5 text-ink hover:text-forest"
            >
              Members
            </Link>
          )}

          {user ? (
            <div className="pt-3 border-t border-borderWarm">
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 font-medium py-1"
              >
                Sign out ({user.name})
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-borderWarm flex space-x-3">
              <Link
                to="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-ink-muted"
              >
                Sign in
              </Link>
              <Link
                to="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-forest"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
