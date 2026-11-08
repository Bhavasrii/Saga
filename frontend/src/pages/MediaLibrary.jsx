import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Check, ExternalLink, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export const MediaLibrary = () => {
  const { user } = useAuth();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/media?limit=60');
      if (data.success) {
        setMedia(data.media || []);
      }
    } catch (err) {
      setError('Unable to load media items.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setFormError('Please provide a title and a valid image URL');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const { data } = await api.post('/media', {
        title: title.trim(),
        url: url.trim(),
        altText: altText.trim(),
      });
      if (data.success) {
        setMedia((prev) => [data.media, ...prev]);
        setFormOpen(false);
        setTitle('');
        setUrl('');
        setAltText('');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save image.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this image from the library?')) {
      return;
    }

    try {
      const { data } = await api.delete(`/media/${id}`);
      if (data.success) {
        setMedia((prev) => prev.filter((m) => m._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete image.');
    }
  };

  const copyUrl = (id, imgUrl) => {
    navigator.clipboard.writeText(imgUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">Media Library</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Store and organise imagery for story covers and editorial features.
          </p>
        </div>

        <button
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded-full transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add image URL
        </button>
      </div>

      {/* Add Modal */}
      {formOpen && (
        <div className="bg-white p-5 rounded-lg border border-borderWarm shadow-sm max-w-xl space-y-4">
          <h3 className="font-serif text-lg font-bold text-ink">Add New Media</h3>

          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">
                Image Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Minimalist Workspace Desk"
                required
                className="w-full px-3 py-2 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                required
                className="w-full px-3 py-2 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink mb-1">
                Alt Text (optional)
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Brief description for accessibility"
                className="w-full px-3 py-2 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
              />
            </div>

            {url && (
              <div className="rounded overflow-hidden h-36 bg-stone-100 border border-borderWarm">
                <img
                  src={url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
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
                {submitting ? 'Please wait...' : 'Save image'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <LoadingSpinner text="Loading media library..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchMedia} />
      ) : media.length === 0 ? (
        <EmptyState
          title="No media in the library"
          description="Add images by URL to use them as story cover pictures."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => {
            const canDelete =
              user &&
              (['admin', 'editor'].includes(user.role) ||
                (item.uploadedBy && item.uploadedBy._id === user._id));

            return (
              <div
                key={item._id}
                className="bg-white rounded-lg border border-borderWarm overflow-hidden shadow-sm flex flex-col justify-between group hover:border-stone-400 transition"
              >
                <div className="relative aspect-video bg-stone-100 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    loading="lazy"
                  />
                </div>

                <div className="p-3">
                  <h4 className="font-medium text-xs text-ink truncate mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-ink-muted">
                    Added by {item.uploadedBy?.name || 'Staff'}
                  </p>
                </div>

                <div className="px-3 pb-3 pt-1 border-t border-borderWarm/60 flex items-center justify-between text-xs">
                  <button
                    onClick={() => copyUrl(item._id, item.url)}
                    className="inline-flex items-center text-ink-muted hover:text-forest text-[11px]"
                  >
                    {copiedId === item._id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-forest mr-1" />
                        <span className="text-forest font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-ink-muted hover:text-red-600 p-1"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
