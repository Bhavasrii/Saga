import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Calendar, User as UserIcon, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TopicBadge from '../components/TopicBadge';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export const StoryDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();

  const [story, setStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentMessage, setCommentMessage] = useState(null);
  const [commentError, setCommentError] = useState(null);

  useEffect(() => {
    fetchStory();
  }, [slug]);

  const fetchStory = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/posts/${slug}`);
      if (data.success && data.post) {
        setStory(data.post);
        // Update document title for story
        document.title = `${data.post.title} — Saga`;
        // Fetch comments for this post
        fetchComments(data.post._id);
      } else {
        setError('Story not found.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load story.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const { data } = await api.get(`/comments/post/${postId}`);
      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    setCommentMessage(null);
    setCommentError(null);

    try {
      const { data } = await api.post('/comments', {
        postId: story._id,
        text: commentText.trim(),
      });

      if (data.success) {
        setCommentMessage(data.message || 'Your comment has been submitted for review.');
        setCommentText('');
        // Refresh comments list
        fetchComments(story._id);
      }
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Opening story..." />;
  }

  if (error || !story) {
    return <ErrorState message={error || 'Story not found.'} onRetry={fetchStory} />;
  }

  const words = (story.content || '').trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(words / 200));

  const publishDate = story.publishAt
    ? new Date(story.publishAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(story.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  return (
    <div className="py-8">
      {/* Centred article container (about 700px wide) */}
      <article className="max-w-[720px] mx-auto px-4">
        {/* Topic & Status Pills */}
        <div className="flex items-center space-x-2 mb-4">
          {story.category && (
            <TopicBadge name={story.category.name} slug={story.category.slug} />
          )}
          {story.status !== 'published' && <StatusBadge status={story.status} />}
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-ink leading-tight mb-4">
          {story.title}
        </h1>

        {/* Excerpt */}
        {story.excerpt && (
          <p className="text-lg sm:text-xl text-ink-muted leading-relaxed font-serif italic mb-6">
            {story.excerpt}
          </p>
        )}

        {/* Byline */}
        <div className="py-4 border-y border-borderWarm flex items-center justify-between text-xs sm:text-sm text-ink-muted mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-forest text-white font-medium flex items-center justify-center text-sm">
              {story.author?.name ? story.author.name.charAt(0).toUpperCase() : 'W'}
            </div>
            <div>
              <p className="font-medium text-ink">{story.author?.name || 'Writer'}</p>
              <div className="flex items-center space-x-2 text-xs text-ink-light">
                <span>{publishDate}</span>
                <span>•</span>
                <span>{readTime} min read</span>
                {story.views > 0 && (
                  <>
                    <span>•</span>
                    <span>{story.views.toLocaleString()} reads</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cover image */}
        {story.coverImage && (
          <div className="mb-10 rounded-lg overflow-hidden border border-borderWarm">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-auto max-h-[480px] object-cover"
            />
          </div>
        )}

        {/* Body content */}
        <div className="prose prose-stone max-w-none text-ink leading-relaxed space-y-6 text-base sm:text-lg">
          {story.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-borderWarm flex flex-wrap gap-2">
            {story.tags.map((tag) => (
              <Link
                key={tag._id}
                to={`/stories?tag=${tag.slug}`}
                className="text-xs text-ink-muted hover:text-forest bg-stone-100 hover:bg-forest-tint px-2.5 py-1 rounded transition"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Author Bio Card */}
        <div className="mt-10 p-6 bg-white rounded-lg border border-borderWarm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-forest-tint text-forest flex items-center justify-center font-bold text-lg">
            {story.author?.name?.charAt(0) || 'W'}
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-ink">
              Written by {story.author?.name}
            </h4>
            <p className="text-xs text-ink-muted mt-0.5">
              Contributor to Saga. Dedicated to writing stories worth telling.
            </p>
          </div>
        </div>

        {/* Comments Section */}
        <section className="mt-16 pt-8 border-t border-borderWarm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-2xl font-bold text-ink flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-forest" />
              <span>Responses ({comments.length})</span>
            </h3>
          </div>

          {/* Comment Form for signed-in users */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-10 bg-white p-5 rounded-lg border border-borderWarm">
              <label className="block text-xs font-medium text-ink mb-2">
                Join the conversation as <span className="font-semibold">{user.name}</span>
              </label>

              {commentMessage && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs rounded border border-emerald-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{commentMessage}</span>
                </div>
              )}

              {commentError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                  {commentError}
                </div>
              )}

              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="What are your thoughts on this story? Leave a thoughtful response..."
                required
                maxLength={1000}
                className="w-full p-3 bg-stone-50 border border-borderWarm rounded text-sm text-ink placeholder-ink-light focus:outline-none focus:border-forest mb-2"
              />

              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span>{1000 - commentText.length} characters left</span>
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="inline-flex items-center px-4 py-2 bg-forest hover:bg-forest-hover text-white font-medium rounded text-xs transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {submittingComment ? 'Please wait...' : 'Submit Response'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-10 p-6 bg-white rounded-lg border border-borderWarm text-center">
              <p className="text-sm text-ink-muted mb-3">
                Sign in to join the conversation and share your perspective.
              </p>
              <Link
                to="/sign-in"
                className="inline-flex items-center px-4 py-2 bg-forest hover:bg-forest-hover text-white text-xs font-medium rounded transition"
              >
                Sign in to join the conversation
              </Link>
            </div>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-muted">
              No responses on this story yet. Be the first to share your thoughts.
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comm) => (
                <div
                  key={comm._id}
                  className="p-4 bg-white rounded-lg border border-borderWarm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 font-medium flex items-center justify-center text-xs">
                        {comm.user?.name ? comm.user.name.charAt(0).toUpperCase() : 'R'}
                      </div>
                      <span className="text-xs font-semibold text-ink">
                        {comm.user?.name || 'Reader'}
                      </span>
                      {comm.status === 'pending' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Pending review
                        </span>
                      )}
                    </div>
                    <time className="text-[11px] text-ink-light">
                      {new Date(comm.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                  <p className="text-xs sm:text-sm text-ink leading-relaxed">
                    {comm.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </article>
    </div>
  );
};

export default StoryDetail;
