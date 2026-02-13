import React from 'react';
import { Link } from 'react-router-dom';

const PublicBlogFooter = ({ settings }) => {
  const mainWebsiteUrl = settings?.primary_cta_href || 'https://envisionwealthplanning.com';

  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        <a href={mainWebsiteUrl} target="_blank" rel="noreferrer">
          Main Website
        </a>
        <Link to="/">Blogs Home</Link>
        <Link to="/all-blogs">All Blogs</Link>
        <Link to="/video-blogs">Video Blogs</Link>
        <Link to="/admin/login" className="footer-admin-link">
          Admin Login
        </Link>
      </div>
    </footer>
  );
};

export default PublicBlogFooter;
