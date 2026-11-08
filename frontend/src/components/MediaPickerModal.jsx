import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Plus } from 'lucide-react';
import api from '../api/axios';

export const MediaPickerModal = ({ isOpen, onClose, onSelect }) => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'add'
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newAlt, setNewAlt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/media?limit=50');
      if (data.success) {
        setMediaList(data.media);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) {
      setError('Please provide an image title and a valid image URL');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data } = await api.post('/media', {
        title: newTitle.trim(),
        url: newUrl.trim(),
        altText: newAlt.trim(),
      });

      if (data.success && data.media) {
        onSelect(data.media.url);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save image. Please verify URL.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none">
      <div className="bg-white rounded-lg border border-borderWarm max-w-2xl w-full max-h-[85vh] flex flex-col shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-borderWarm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('library')}
              className={`text-sm font-medium pb-1 border-b-2 transition ${
                activeTab === 'library'
                  ? 'border-forest text-forest'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              Media Library
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`text-sm font-medium pb-1 border-b-2 transition ${
                activeTab === 'add'
                  ? 'border-forest text-forest'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              Add Image URL
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink p-1 rounded hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'library' ? (
            <div>
              {loading ? (
                <div className="py-12 text-center text-sm text-ink-muted">
                  Loading images...
                </div>
              ) : mediaList.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-ink-muted mb-4">No images in your library yet.</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-forest bg-forest-tint border border-forest-light rounded hover:bg-forest hover:text-white transition"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add an image URL
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mediaList.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => {
                        onSelect(item.url);
                        onClose();
                      }}
                      className="group relative rounded border border-borderWarm overflow-hidden aspect-video bg-stone-100 focus:outline-none focus:ring-2 focus:ring-forest hover:border-forest"
                    >
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left">
                        <p className="text-white text-xs truncate">{item.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleAddNew} className="space-y-4 max-w-md mx-auto py-2">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Image Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Modern Architecture Desk"
                  required
                  className="w-full px-3 py-2 border border-borderWarm rounded text-sm focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  required
                  className="w-full px-3 py-2 border border-borderWarm rounded text-sm focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Alt Text (optional)
                </label>
                <input
                  type="text"
                  value={newAlt}
                  onChange={(e) => setNewAlt(e.target.value)}
                  placeholder="Describe the image for screen readers"
                  className="w-full px-3 py-2 border border-borderWarm rounded text-sm focus:outline-none focus:border-forest"
                />
              </div>

              {newUrl && (
                <div className="mt-2">
                  <p className="text-xs text-ink-muted mb-1">Preview:</p>
                  <img
                    src={newUrl}
                    alt="Preview"
                    className="w-full h-36 object-cover rounded border border-borderWarm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-borderWarm rounded text-sm text-ink hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-forest hover:bg-forest-hover text-white rounded text-sm font-medium transition disabled:opacity-50"
                >
                  {submitting ? 'Please wait...' : 'Add and Use Image'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaPickerModal;
