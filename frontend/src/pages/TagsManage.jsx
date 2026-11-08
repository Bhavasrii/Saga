import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Tag as TagIcon } from 'lucide-react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export const TagsManage = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/tags');
      if (data.success) {
        setTags(data.tags || []);
      }
    } catch (err) {
      setError('Unable to load tags.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingTag(null);
    setName('');
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (tag) => {
    setEditingTag(tag);
    setName(tag.name);
    setFormError('');
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Tag name is required');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (editingTag) {
        await api.put(`/tags/${editingTag._id}`, { name: name.trim() });
      } else {
        await api.post('/tags', { name: name.trim() });
      }
      setFormOpen(false);
      fetchTags();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save tag.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) {
      return;
    }

    try {
      const { data } = await api.delete(`/tags/${id}`);
      if (data.success) {
        setTags((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete tag.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">Tags</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Label stories with descriptive keywords for discovery and cross-referencing.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center px-4 py-2 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded-full transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add tag
        </button>
      </div>

      {/* Form modal/panel */}
      {formOpen && (
        <div className="bg-white p-5 rounded-lg border border-borderWarm shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-ink">
            {editingTag ? 'Edit Tag' : 'New Tag'}
          </h3>

          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tag name (e.g. Architecture, Typography)"
              required
              className="flex-1 px-3 py-2 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
            />

            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 border border-borderWarm text-xs font-medium rounded text-ink hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded transition disabled:opacity-50"
            >
              {submitting ? 'Please wait...' : editingTag ? 'Update' : 'Create'}
            </button>
          </form>
        </div>
      )}

      {/* Tags Grid */}
      {loading ? (
        <LoadingSpinner text="Loading tags..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTags} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {tags.map((tag) => (
            <div
              key={tag._id}
              className="bg-white p-3.5 rounded-lg border border-borderWarm flex items-center justify-between shadow-sm hover:border-stone-400 transition"
            >
              <div>
                <span className="text-xs font-semibold text-ink">#{tag.name}</span>
                <p className="text-[11px] text-ink-muted">
                  {tag.storyCount || 0} stories
                </p>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => openEdit(tag)}
                  className="p-1 text-ink-muted hover:text-forest"
                  title="Edit tag"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(tag._id)}
                  className="p-1 text-ink-muted hover:text-red-600"
                  title="Delete tag"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsManage;
