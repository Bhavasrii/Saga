import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit3, Trash2, ExternalLink, Plus } from 'lucide-react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import TopicBadge from '../components/TopicBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export const AllStories = () => {
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchAllStories();
  }, [statusFilter, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit: 100,
      };

      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get('/posts', { params });
      if (data.success) {
        setStories(data.posts || []);
      }
    } catch (err) {
      setError('Unable to load editorial story list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAllStories();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this story? This cannot be undone.')) {
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">Editorial Stories</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Review, edit, publish, or remove any story across the platform.
          </p>
        </div>

        <Link
          to="/write"
          className="inline-flex items-center justify-center px-4 py-2 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded-full transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Create story
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-borderWarm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
          />
          <Search className="w-3.5 h-3.5 text-ink-light absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="pending">Under review</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Drafts</option>
          </select>

          {/* Topic filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
          >
            <option value="">All topics</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stories Table */}
      {loading ? (
        <LoadingSpinner text="Loading stories list..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAllStories} />
      ) : stories.length === 0 ? (
        <EmptyState
          title="No stories found"
          description="No stories match the active filters."
        />
      ) : (
        <div className="bg-white rounded-lg border border-borderWarm overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-borderWarm text-ink-muted uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reads</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderWarm/60">
                {stories.map((story) => (
                  <tr key={story._id} className="hover:bg-stone-50/50 transition">
                    <td className="py-3 px-4 font-medium text-ink max-w-xs truncate">
                      <Link
                        to={story.status === 'published' ? `/story/${story.slug}` : `/edit/${story._id}`}
                        className="hover:text-forest transition"
                      >
                        {story.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-ink-muted">
                      {story.author?.name || 'Writer'}
                    </td>
                    <td className="py-3 px-4">
                      {story.category ? (
                        <span className="text-forest font-medium">
                          {story.category.name}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={story.status} />
                    </td>
                    <td className="py-3 px-4 text-ink-muted">
                      {story.views.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-ink-light">
                      {new Date(story.publishAt || story.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {story.status === 'published' && (
                        <Link
                          to={`/story/${story.slug}`}
                          className="inline-block p-1 text-ink-muted hover:text-forest"
                          title="View"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                      <Link
                        to={`/edit/${story._id}`}
                        className="inline-block p-1 text-ink-muted hover:text-forest"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(story._id)}
                        disabled={deletingId === story._id}
                        className="p-1 text-ink-muted hover:text-red-600 disabled:opacity-40"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllStories;
