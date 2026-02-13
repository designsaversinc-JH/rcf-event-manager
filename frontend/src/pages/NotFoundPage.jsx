import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="not-found">
    <h1>Page not found</h1>
    <Link to="/">Return to home</Link>
  </div>
);

export default NotFoundPage;
