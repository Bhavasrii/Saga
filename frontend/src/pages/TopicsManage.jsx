import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, FolderTree } from 'lucide-react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export const TopicsManage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/categories');
      if (data.success) {
        setTopics(data.categories || []);
      }
    } catch (err) {
      setError('Unable to load topics.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingTopic(null);
    setName('');
    setDescription('');
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (topic) => {
    setEditingTopic(topic);
    setName(topic.name);
    setDescription(topic.description || '');
    setFormError('');
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Topic name cannot be empty');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (editingTopic) {
        await api.put(`/categories/${editingTopic._id}`, {
          name: name.trim(),
          description: description.trim(),
        });
      } else {
        await api.post('/categories', {
          name: name.trim(),
          description: description.trim(),
        });
      }
      setFormOpen(false);
      fetchTopics();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save topic.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, count) => {
    if (count > 0) {
      alert(`Cannot delete topic: ${count} stories are currently filed under it.`);
      return;
    }

    if (!window.confirm('Are you sure you want to delete this topic?')) {
      return;
    }

    try {
      const { data } = await api.delete(`/categories/${id}`);
      if (data.success) {
        setTopics((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete topic.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">Topics</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Organise publication stories into primary thematic subjects.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center px-4 py-2 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded-full transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add topic
        </button>
      </div>

      {/* Form Modal / Panel */}
      {formOpen && (
        <div className="bg-white p-5 rounded-lg border border-borderWarm shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-ink">
            {editingTopic ? 'Edit Topic' : 'New Topic'}
          </h3>

          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">
                Topic name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Technology, Design, Architecture"
                required
                className="w-full px-3 py-2 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short description explaining the scope of this topic..."
                className="w-full px-3 py-2 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-1.5 border border-borderWarm text-xs font-medium rounded text-ink hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded transition disabled:opacity-50"
              >
                {submitting ? 'Please wait...' : editingTopic ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Topics list */}
      {loading ? (
        <LoadingSpinner text="Loading topics..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTopics} />
      ) : (
        <div className="bg-white rounded-lg border border-borderWarm divide-y divide-borderWarm/60 overflow-hidden shadow-sm">
          {topics.map((topic) => (
            <div
              key={topic._id}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-stone-50/50 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-serif text-base font-bold text-ink">
                    {topic.name}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-forest-tint text-forest border border-forest-light font-medium">
                    {topic.storyCount} {topic.storyCount === 1 ? 'story' : 'stories'}
                  </span>
                </div>
                {topic.description && (
                  <p className="text-xs text-ink-muted">{topic.description}</p>
                )}
                <p className="text-[11px] text-ink-light">Slug: {topic.slug}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEdit(topic)}
                  className="p-1.5 text-ink-muted hover:text-forest hover:bg-forest-tint rounded transition"
                  title="Edit topic"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(topic._id, topic.storyCount)}
                  className="p-1.5 text-ink-muted hover:text-red-600 hover:bg-red-50 rounded transition"
                  title="Delete topic"
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

export default TopicsManage;
