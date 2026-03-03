import React from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';

const NotFoundPage = () => {
  usePageMeta({
    title: 'Page Not Found | Roseland Ceasefire',
    description: 'The requested page could not be found.',
    noIndex: true,
  });

  return (
    <div className="not-found">
      <h1>Page not found</h1>
      <Link to="/">Return to home</Link>
    </div>
  );
};

export default NotFoundPage;
