import React from 'react';
import { Link } from 'react-router-dom';

export const TopicBadge = ({ name, slug, clickable = true }) => {
  if (!name) return null;

  const content = (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-forest-tint text-forest border border-forest-light hover:bg-forest hover:text-white transition-colors duration-150">
      {name}
    </span>
  );

  if (clickable && slug) {
    return <Link to={`/stories?category=${slug}`}>{content}</Link>;
  }

  return content;
};

export default TopicBadge;
