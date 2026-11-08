import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Save, Check, Calendar } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import MediaPickerModal from '../components/MediaPickerModal';
import LoadingSpinner from '../components/LoadingSpinner';

export const StoryEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEditing = Boolean(id);
  const isStaff = user && ['editor', 'admin'].includes(user.role);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [status, setStatus] = useState('draft');
  const [publishAt, setPublishAt] = useState('');

  const [categories, setCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  // Load categories and tags
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          api.get('/categories'),
          api.get('/tags'),
        ]);

        if (catRes.data.success && catRes.data.categories?.length > 0) {
          setCategories(catRes.data.categories);
          if (!category && !isEditing) {
            setCategory(catRes.data.categories[0]._id);
          }
        }

        if (tagRes.data.success) {
          setAllTags(tagRes.data.tags || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchMetadata();
  }, []);

  // If editing, load existing post
  useEffect(() => {
    if (isEditing) {
      const fetchPost = async () => {
        try {
          // Find post by fetching posts or by slug/id
          const { data } = await api.get('/posts?limit=100&mine=true');
          const found = data.posts?.find((p) => p._id === id);

          if (found) {
            setTitle(found.title || '');
            setContent(found.content || '');
            setExcerpt(found.excerpt || '');
            setCoverImage(found.coverImage || '');
            setCategory(found.category?._id || found.category || '');
            setSelectedTags(found.tags?.map((t) => t._id || t) || []);
            setStatus(found.status || 'draft');
            if (found.publishAt) {
              const dt = new Date(found.publishAt);
              setPublishAt(dt.toISOString().slice(0, 16));
            }
          } else {
            // Also attempt to get directly via all-stories or endpoint
            const res = await api.get('/posts?limit=100');
            const foundInAll = res.data.posts?.find((p) => p._id === id);
            if (foundInAll) {
              setTitle(foundInAll.title || '');
              setContent(foundInAll.content || '');
              setExcerpt(foundInAll.excerpt || '');
              setCoverImage(foundInAll.coverImage || '');
              setCategory(foundInAll.category?._id || foundInAll.category || '');
              setSelectedTags(foundInAll.tags?.map((t) => t._id || t) || []);
              setStatus(foundInAll.status || 'draft');
              if (foundInAll.publishAt) {
                const dt = new Date(foundInAll.publishAt);
                setPublishAt(dt.toISOString().slice(0, 16));
              }
            } else {
              setErrorMessage('Story not found or you lack permission to edit it.');
            }
          }
        } catch (err) {
          setErrorMessage('Could not load the story.');
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [id, isEditing]);

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Please give your story a title.');
      return;
    }

    if (!category) {
      setErrorMessage('Please select a topic for your story.');
      return;
    }

    if (!content.trim()) {
      setErrorMessage('Please write some content for your story.');
      return;
    }

    if (status === 'scheduled' && !publishAt) {
      setErrorMessage('Please specify a scheduled publication date and time.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim(),
        coverImage: coverImage.trim(),
        category,
        tags: selectedTags,
        status,
        publishAt: status === 'scheduled' && publishAt ? new Date(publishAt) : null,
      };

      if (isEditing) {
        await api.put(`/posts/${id}`, payload);
      } else {
        await api.post('/posts', payload);
      }

      // Mandatory redirection rule:
      // Writers redirect to "Your stories", editors/admins redirect to "All stories"
      if (isStaff) {
        navigate('/all-stories');
      } else {
        navigate('/your-stories');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to save story. Please review your entries.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading story editor..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-borderWarm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1.5 text-xs text-ink-muted hover:text-ink transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="font-serif text-xl font-bold text-ink">
          {isEditing ? 'Edit story' : 'Draft a new story'}
        </h1>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded-full transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {submitting ? 'Please wait...' : isEditing ? 'Save changes' : 'Save story'}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs rounded border border-red-200">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Story title..."
            required
            className="w-full font-serif text-3xl sm:text-4xl font-bold bg-transparent border-none placeholder-ink-light/50 focus:outline-none text-ink py-2"
          />
        </div>

        {/* Short Summary (Excerpt) */}
        <div>
          <label className="block text-xs font-medium text-ink-muted mb-1">
            Short summary (excerpt)
          </label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A compelling one- or two-sentence summary shown on cards and story headers..."
            className="w-full p-3 bg-white border border-borderWarm rounded text-sm text-ink placeholder-ink-light focus:outline-none focus:border-forest"
          />
        </div>

        {/* Topic & Publishing Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-borderWarm">
          {/* Topic */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Topic (Category) *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full p-2 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
            >
              <option value="">Select a topic</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Publishing Status */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Publishing status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
            >
              <option value="draft">Draft (Save privately)</option>
              <option value="pending">Submit for review (Editorial approval)</option>
              {isStaff && (
                <>
                  <option value="published">Publish now (Live for readers)</option>
                  <option value="scheduled">Schedule publication</option>
                </>
              )}
            </select>
          </div>

          {/* Scheduled Date picker (if status === 'scheduled') */}
          {status === 'scheduled' && (
            <div className="sm:col-span-2 pt-2 border-t border-borderWarm">
              <label className="block text-xs font-medium text-ink mb-1.5">
                Publication date and time
              </label>
              <input
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                required
                className="w-full sm:w-auto p-2 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
              />
              <p className="text-[11px] text-ink-muted mt-1">
                The story will automatically be published when this time arrives.
              </p>
            </div>
          )}
        </div>

        {/* Cover image picker & URL */}
        <div className="bg-white p-4 rounded-lg border border-borderWarm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-ink">Cover image</label>
            <button
              type="button"
              onClick={() => setMediaModalOpen(true)}
              className="inline-flex items-center text-xs text-forest hover:underline font-medium"
            >
              <ImageIcon className="w-3.5 h-3.5 mr-1" />
              Pick from Media Library
            </button>
          </div>

          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
            className="w-full p-2 bg-stone-50 border border-borderWarm rounded text-xs text-ink placeholder-ink-light focus:outline-none focus:border-forest"
          />

          {coverImage && (
            <div className="relative rounded overflow-hidden h-44 bg-stone-100 border border-borderWarm">
              <img
                src={coverImage}
                alt="Cover Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setCoverImage('')}
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Tags Selection */}
        {allTags.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-borderWarm">
            <label className="block text-xs font-medium text-ink mb-2">
              Tags (select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isSelected = selectedTags.includes(tag._id);
                return (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => toggleTag(tag._id)}
                    className={`px-2.5 py-1 rounded text-xs transition flex items-center space-x-1 ${
                      isSelected
                        ? 'bg-forest text-white font-medium'
                        : 'bg-stone-100 text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>#{tag.name}</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">
            Story content *
          </label>
          <textarea
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your story here. Separate paragraphs with double newlines..."
            required
            className="w-full p-4 bg-white border border-borderWarm rounded-lg text-base text-ink placeholder-ink-light focus:outline-none focus:border-forest leading-relaxed font-sans"
          />
        </div>

        {/* Bottom submit button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-6 py-2.5 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded-full transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {submitting ? 'Please wait...' : isEditing ? 'Save changes' : 'Save story'}
          </button>
        </div>
      </form>

      {/* Media Library Picker Modal */}
      <MediaPickerModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(url) => setCoverImage(url)}
      />
    </div>
  );
};

export default StoryEditor;
