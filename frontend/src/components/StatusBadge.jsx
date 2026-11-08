import React from 'react';

const statusStyles = {
  published: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  scheduled: 'bg-sky-50 text-sky-800 border-sky-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  draft: 'bg-stone-100 text-stone-700 border-stone-200',
};

const statusLabels = {
  published: 'Published',
  scheduled: 'Scheduled',
  pending: 'Under review',
  draft: 'Draft',
};

export const StatusBadge = ({ status }) => {
  const currentStatus = (status || 'draft').toLowerCase();
  const style = statusStyles[currentStatus] || statusStyles.draft;
  const label = statusLabels[currentStatus] || currentStatus;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
