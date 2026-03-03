import React from 'react';

const EmptyList = ({ title = 'No events found', description = 'Try adjusting your filters to see more results.' }) => (
  <div className="empty-list-card" role="status" aria-live="polite">
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

export default EmptyList;
