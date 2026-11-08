import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../api/axios';
import StoryCard from '../components/StoryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export const Stories = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 9 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page'), 10) || 1;

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Fetch filter metadata (categories, tags)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          api.get('/categories'),
          api.get('/tags'),
        ]);
        if (catRes.data.success) setCategories(catRes.data.categories || []);
        if (tagRes.data.success) setTags(tagRes.data.tags || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch posts whenever searchParams change
  useEffect(() => {
    fetchStories();
  }, [searchParams]);

  const fetchStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 9,
        sort: currentSort,
      };

      if (currentSearch) params.search = currentSearch;
      if (currentCategory) params.category = currentCategory;
      if (currentTag) params.tag = currentTag;

      const { data } = await api.get('/posts', { params });
      if (data.success) {
        setPosts(data.posts || []);
        setPagination(data.pagination || { total: 0, page: 1, pages: 1, limit: 9 });
      }
    } catch (err) {
      setError('Unable to load stories at this moment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const hasActiveFilters = !!(currentSearch || currentCategory || currentTag || currentSort !== 'newest');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-2">
          Explore stories
        </h1>
        <p className="text-sm text-ink-muted">
          Browse published essays, tutorials, and reflections across all topics.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-lg border border-borderWarm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by keywords..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-borderWarm rounded text-sm text-ink focus:outline-none focus:border-forest"
            />
            <Search className="w-4 h-4 text-ink-light absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-forest hover:bg-forest-hover text-white text-xs font-medium rounded transition"
          >
            Search
          </button>
        </form>

        {/* Filter rows */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-borderWarm/60 text-xs">
          {/* Topics Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-ink-muted font-medium mr-1">Topic:</span>
            <button
              onClick={() => updateFilter('category', '')}
              className={`px-2.5 py-1 rounded text-xs transition ${
                !currentCategory
                  ? 'bg-forest text-white font-medium'
                  : 'bg-stone-100 text-ink-muted hover:text-ink'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => updateFilter('category', cat.slug)}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  currentCategory === cat.slug
                    ? 'bg-forest text-white font-medium'
                    : 'bg-stone-100 text-ink-muted hover:text-ink'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort & Tag controls */}
          <div className="flex items-center space-x-3">
            {/* Tag selector */}
            {tags.length > 0 && (
              <select
                value={currentTag}
                onChange={(e) => updateFilter('tag', e.target.value)}
                className="px-2.5 py-1 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
              >
                <option value="">All tags</option>
                {tags.map((t) => (
                  <option key={t._id} value={t.slug}>
                    #{t.name}
                  </option>
                ))}
              </select>
            )}

            {/* Sort selector */}
            <select
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="px-2.5 py-1 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
            >
              <option value="newest">Newest first</option>
              <option value="most-read">Most read</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center text-red-600 hover:text-red-700 text-xs font-medium ml-1"
              >
                <X className="w-3.5 h-3.5 mr-0.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stories Listing */}
      {loading ? (
        <LoadingSpinner text="Loading stories..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStories} />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No stories found"
          description="Try broadening your search criteria or resetting active filters."
          action={
            hasActiveFilters ? (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 border border-borderWarm text-xs font-medium rounded text-ink bg-stone-50 hover:bg-stone-100"
              >
                Reset filters
              </button>
            ) : null
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pt-8 flex items-center justify-center space-x-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => updateFilter('page', (pagination.page - 1).toString())}
                className="px-3 py-1.5 border border-borderWarm rounded text-xs font-medium text-ink bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-ink-muted px-2">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => updateFilter('page', (pagination.page + 1).toString())}
                className="px-3 py-1.5 border border-borderWarm rounded text-xs font-medium text-ink bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Stories;
