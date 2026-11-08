import React from 'react';
import { BookOpen } from 'lucide-react';

export const EmptyState = ({
  title = 'No stories here yet',
  description = 'Check back soon for newly published stories or try adjusting your filters.',
  action = null,
}) => {
  return (
    <div className="py-16 px-4 bg-white rounded-lg border border-borderWarm text-center max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-forest-tint text-forest flex items-center justify-center mx-auto mb-4">
        <BookOpen className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-lg font-bold text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink-muted mb-6 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
