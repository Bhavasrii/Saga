import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PenLine, Edit3, Trash2, Eye, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import TopicBadge from '../components/TopicBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export const YourStories = () => {
  const [stories, setStories] = useState([]);
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'published' | 'draft' | 'pending' | 'scheduled'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMyStories();
  }, [statusFilter]);

  const fetchMyStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        mine: 'true',
        limit: 100,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      const { data } = await api.get('/posts', { params });
      if (data.success) {
        setStories(data.posts || []);
      }
    } catch (err) {
      setError('Unable to load your stories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const { data } = await api.delete(`/posts/${id}`);
      if (data.success) {
        setStories((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete story.');
    } finally {
      setDeletingId(null);
    }
  };

  const tabs = [
    { label: 'All', value: '' },
    { label: 'Published', value: 'published' },
    { label: 'Drafts', value: 'draft' },
    { label: 'Under review', value: 'pending' },
    { label: 'Scheduled', value: 'scheduled' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">Your stories</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Manage your drafts, submissions, and published writing.
          </p>
        </div>

        <Link
          to="/write"
          className="inline-flex items-center justify-center px-4 py-2 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded-full transition shadow-sm"
        >
          <PenLine className="w-3.5 h-3.5 mr-1.5" />
          Write a story
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-borderWarm space-x-6 text-xs sm:text-sm overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`pb-3 font-medium border-b-2 transition whitespace-nowrap ${
              statusFilter === tab.value
                ? 'border-forest text-forest'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content list */}
      {loading ? (
        <LoadingSpinner text="Loading your stories..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchMyStories} />
      ) : stories.length === 0 ? (
        <EmptyState
          title="No stories found"
          description={
            statusFilter
              ? `You don't have any stories with the status "${statusFilter}".`
              : "You haven't written any stories yet. Start writing your first story today."
          }
          action={
            <Link
              to="/write"
              className="inline-flex items-center px-4 py-2 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded-full transition"
            >
              <PenLine className="w-3.5 h-3.5 mr-1.5" />
              Start writing
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-borderWarm divide-y divide-borderWarm/60 overflow-hidden">
          {stories.map((story) => (
            <div
              key={story._id}
              className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-stone-50/50 transition"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <StatusBadge status={story.status} />
                  {story.category && (
                    <TopicBadge
                      name={story.category.name}
                      slug={story.category.slug}
                      clickable={false}
                    />
                  )}
                  {story.publishAt && story.status === 'scheduled' && (
                    <span className="text-[11px] text-ink-muted">
                      Scheduled for{' '}
                      {new Date(story.publishAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-lg font-bold text-ink truncate">
                  <Link
                    to={story.status === 'published' ? `/story/${story.slug}` : `/edit/${story._id}`}
                    className="hover:text-forest transition"
                  >
                    {story.title}
                  </Link>
                </h3>

                <div className="flex items-center space-x-3 text-xs text-ink-muted">
                  <span>
                    Updated{' '}
                    {new Date(story.updatedAt || story.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span>•</span>
                  <span>{story.views} reads</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 self-end sm:self-center">
                {story.status === 'published' && (
                  <Link
                    to={`/story/${story.slug}`}
                    className="p-2 text-ink-muted hover:text-forest hover:bg-forest-tint rounded transition"
                    title="View published story"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}

                <Link
                  to={`/edit/${story._id}`}
                  className="p-2 text-ink-muted hover:text-forest hover:bg-forest-tint rounded transition"
                  title="Edit story"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleDelete(story._id)}
                  disabled={deletingId === story._id}
                  className="p-2 text-ink-muted hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-40"
                  title="Delete story"
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

export default YourStories;
