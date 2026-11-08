import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SignUp = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Could not create account. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-lg border border-borderWarm p-8 shadow-sm">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="font-serif text-3xl font-bold tracking-tight text-ink">
              Saga
            </span>
          </Link>
          <p className="text-xs text-ink-muted mt-1">Stories worth telling.</p>
        </div>

        <div className="mb-6">
          <h2 className="font-serif text-xl font-bold text-ink">Create your account</h2>
          <p className="text-xs text-ink-muted mt-1">
            Join a community of curious minds and thoughtful writers.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Elena Rostova"
              required
              className="w-full px-3 py-2.5 bg-stone-50 border border-borderWarm rounded text-sm text-ink placeholder-ink-light focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2.5 bg-stone-50 border border-borderWarm rounded text-sm text-ink placeholder-ink-light focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Password (6+ characters)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3 py-2.5 bg-stone-50 border border-borderWarm rounded text-sm text-ink placeholder-ink-light focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2.5 bg-stone-50 border border-borderWarm rounded text-sm text-ink placeholder-ink-light focus:outline-none focus:border-forest"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-2.5 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded transition duration-150 disabled:opacity-50"
          >
            {submitting ? 'Please wait...' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-borderWarm/60 text-center text-xs text-ink-muted">
          Already have an account?{' '}
          <Link to="/sign-in" className="text-forest font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
