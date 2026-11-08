import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Trash2, Search, MessageSquare, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export const CommentsManage = () => {
  const [comments, setComments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending'); // default to pending for review queue
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [statusFilter]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit: 50,
      };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get('/comments', { params });
      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (err) {
      setError('Unable to load comments for review.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(id);
    try {
      const { data } = await api.put(`/comments/${id}/status`, { status: newStatus });
      if (data.success) {
        // If filtering by a specific status, remove it from list
        if (statusFilter && statusFilter !== newStatus) {
          setComments((prev) => prev.filter((c) => c._id !== id));
        } else {
          setComments((prev) =>
            prev.map((c) => (c._id === id ? data.comment : c))
          );
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update comment status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const { data } = await api.delete(`/comments/${id}`);
      if (data.success) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment.');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComments();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink">Comment Review Queue</h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Review community responses to maintain high editorial and discourse standards.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-borderWarm flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Status buttons */}
        <div className="flex space-x-2 text-xs">
          {[
            { label: 'Pending review', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'All', value: '' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded transition font-medium ${
                statusFilter === tab.value
                  ? 'bg-forest text-white'
                  : 'bg-stone-100 text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search response text..."
            className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
          />
          <Search className="w-3.5 h-3.5 text-ink-light absolute left-2.5 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Comment list */}
      {loading ? (
        <LoadingSpinner text="Checking comment review queue..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchComments} />
      ) : comments.length === 0 ? (
        <EmptyState
          title="Queue is empty"
          description={
            statusFilter === 'pending'
              ? 'No comments waiting for review at this moment.'
              : 'No comments found for this filter.'
          }
        />
      ) : (
        <div className="space-y-3">
          {comments.map((comm) => (
            <div
              key={comm._id}
              className="bg-white p-5 rounded-lg border border-borderWarm shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-ink">
                    {comm.user?.name || 'Reader'}
                  </span>
                  <span className="text-ink-light text-[11px]">
                    ({comm.user?.email})
                  </span>
                  <span className="text-ink-muted">•</span>
                  <span className="text-ink-muted">on</span>
                  <Link
                    to={comm.post?.slug ? `/story/${comm.post.slug}` : '#'}
                    className="font-medium text-forest hover:underline max-w-xs truncate"
                  >
                    {comm.post?.title || 'Story'}
                  </Link>
                  <span className="text-ink-muted">•</span>
                  <time className="text-ink-light text-[11px]">
                    {new Date(comm.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                  <span
                    className={`ml-2 text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-semibold ${
                      comm.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : comm.status === 'rejected'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {comm.status}
                  </span>
                </div>

                <p className="text-sm text-ink leading-relaxed bg-stone-50/60 p-3 rounded border border-borderWarm/40">
                  {comm.text}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 self-end sm:self-start pt-1">
                {comm.status !== 'approved' && (
                  <button
                    onClick={() => handleStatusChange(comm._id, 'approved')}
                    disabled={actionLoading === comm._id}
                    className="inline-flex items-center px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Approve
                  </button>
                )}

                {comm.status !== 'rejected' && (
                  <button
                    onClick={() => handleStatusChange(comm._id, 'rejected')}
                    disabled={actionLoading === comm._id}
                    className="inline-flex items-center px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium rounded transition disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Reject
                  </button>
                )}

                <button
                  onClick={() => handleDelete(comm._id)}
                  className="p-1.5 text-ink-muted hover:text-red-600 rounded hover:bg-red-50 transition"
                  title="Delete comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsManage;
