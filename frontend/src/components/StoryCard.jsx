import React from 'react';
import { Link } from 'react-router-dom';
import TopicBadge from './TopicBadge';

export const StoryCard = ({ story }) => {
  if (!story) return null;

  const words = (story.content || '').trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(words / 200));

  const publishDate = story.publishAt
    ? new Date(story.publishAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(story.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  return (
    <article className="group bg-white rounded-lg border border-borderWarm overflow-hidden flex flex-col transition duration-200 hover:border-stone-400">
      {story.coverImage && (
        <Link to={`/story/${story.slug}`} className="block overflow-hidden h-48 bg-stone-100">
          <img
            src={story.coverImage}
            alt={story.title}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </Link>
      )}

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {story.category && (
            <div className="mb-2.5">
              <TopicBadge name={story.category.name} slug={story.category.slug} />
            </div>
          )}

          <h3 className="font-serif text-xl font-bold leading-snug mb-2 group-hover:text-forest transition-colors">
            <Link to={`/story/${story.slug}`}>{story.title}</Link>
          </h3>

          {story.excerpt && (
            <p className="text-ink-muted text-sm leading-relaxed line-clamp-2 mb-4">
              {story.excerpt}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-borderWarm/60 flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-ink">{story.author?.name || 'Writer'}</span>
            <span>•</span>
            <time dateTime={story.publishAt || story.createdAt}>{publishDate}</time>
          </div>
          <span>{readTime} min read</span>
        </div>
      </div>
    </article>
  );
};

export default StoryCard;
