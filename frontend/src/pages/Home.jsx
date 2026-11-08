import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, PenLine } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StoryCard from '../components/StoryCard';
import TopicBadge from '../components/TopicBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [featuredStory, setFeaturedStory] = useState(null);
  const [latestStories, setLatestStories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch published stories
      const [storiesRes, topicsRes] = await Promise.all([
        api.get('/posts?limit=7&sort=newest'),
        api.get('/categories'),
      ]);

      if (storiesRes.data.success) {
        const posts = storiesRes.data.posts || [];
        if (posts.length > 0) {
          setFeaturedStory(posts[0]);
          setLatestStories(posts.slice(1));
        } else {
          setFeaturedStory(null);
          setLatestStories([]);
        }
      }

      if (topicsRes.data.success) {
        setTopics(topicsRes.data.categories || []);
      }
    } catch (err) {
      setError('Unable to load latest stories at this moment. Please check back shortly.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/stories?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Curating stories for you..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchHomeData} />;
  }

  return (
    <div className="space-y-16 py-8">
      {/* Hero section */}
      <section className="text-center max-w-3xl mx-auto px-4 pt-6 pb-2">
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink mb-4 leading-tight">
          Read what moves you.
          <span className="block italic font-normal text-ink-muted sm:inline sm:font-bold sm:not-italic sm:text-ink">
            {' '}Write what matters.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-ink-muted mb-8 max-w-xl mx-auto leading-relaxed">
          Thoughtfully written essays, timeless perspectives, and craft-driven journalism from independent thinkers.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories by topic, keyword, or author..."
            className="w-full pl-11 pr-24 py-3 bg-white rounded-full border border-borderWarm text-sm text-ink placeholder-ink-light focus:outline-none focus:border-forest transition shadow-sm"
          />
          <Search className="w-5 h-5 text-ink-light absolute left-4 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-forest hover:bg-forest-hover text-white text-xs font-medium rounded-full transition"
          >
            Explore
          </button>
        </form>

        {/* Browse by topic chips */}
        {topics.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-ink-muted mr-1">Browse topics:</span>
            {topics.map((topic) => (
              <TopicBadge key={topic._id} name={topic.name} slug={topic.slug} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Story */}
      {featuredStory && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-xs font-semibold tracking-wider text-forest uppercase mb-3">
            Featured Story
          </div>
          <div className="bg-white rounded-lg border border-borderWarm overflow-hidden grid grid-cols-1 md:grid-cols-12 transition hover:border-stone-400">
            {featuredStory.coverImage && (
              <div className="md:col-span-7 aspect-video md:aspect-auto overflow-hidden bg-stone-100">
                <Link to={`/story/${featuredStory.slug}`}>
                  <img
                    src={featuredStory.coverImage}
                    alt={featuredStory.title}
                    className="w-full h-full object-cover transition duration-300 hover:scale-[1.02]"
                  />
                </Link>
              </div>
            )}
            <div className={`p-6 sm:p-8 flex flex-col justify-between ${featuredStory.coverImage ? 'md:col-span-5' : 'md:col-span-12'}`}>
              <div>
                {featuredStory.category && (
                  <div className="mb-3">
                    <TopicBadge
                      name={featuredStory.category.name}
                      slug={featuredStory.category.slug}
                    />
                  </div>
                )}
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink leading-tight mb-3">
                  <Link
                    to={`/story/${featuredStory.slug}`}
                    className="hover:text-forest transition-colors"
                  >
                    {featuredStory.title}
                  </Link>
                </h2>
                <p className="text-ink-muted text-sm sm:text-base leading-relaxed line-clamp-3 mb-6">
                  {featuredStory.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-borderWarm flex items-center justify-between text-xs text-ink-muted">
                <div>
                  <span className="font-medium text-ink block sm:inline">
                    {featuredStory.author?.name}
                  </span>
                  <span className="hidden sm:inline"> • </span>
                  <time dateTime={featuredStory.publishAt || featuredStory.createdAt}>
                    {new Date(featuredStory.publishAt || featuredStory.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </div>
                <span>
                  {Math.max(1, Math.ceil((featuredStory.content || '').split(/\s+/).length / 200))} min read
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Stories */}
      {latestStories.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-ink">Latest stories</h2>
            <Link
              to="/stories"
              className="text-xs font-medium text-forest hover:text-forest-hover flex items-center space-x-1"
            >
              <span>View all stories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestStories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>
        </section>
      )}

      {/* Calm Call to Action Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-forest-tint rounded-lg border border-forest-light p-8 sm:p-10 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-2">
            Have something to say? Start writing
          </h2>
          <p className="text-sm text-ink-muted max-w-md mx-auto mb-6 leading-relaxed">
            Share your expertise, personal reflections, and ideas with readers who value depth, nuance, and good writing.
          </p>
          <div className="flex items-center justify-center space-x-4">
            {user ? (
              <Link
                to="/write"
                className="inline-flex items-center px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-forest hover:bg-forest-hover transition shadow-sm"
              >
                <PenLine className="w-4 h-4 mr-1.5" />
                Start writing
              </Link>
            ) : (
              <Link
                to="/sign-up"
                className="inline-flex items-center px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-forest hover:bg-forest-hover transition shadow-sm"
              >
                Create your account
              </Link>
            )}
            <Link
              to="/stories"
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-ink hover:text-forest border border-borderWarm bg-white transition"
            >
              Read more stories
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
