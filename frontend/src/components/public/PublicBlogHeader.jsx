import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const PublicBlogHeader = () => (
  <header className="blog-topbar">
    <div className="blog-topbar-inner">
      <Link to="/" className="brand-logo-link">
        <div className="brand-mark" />
        <div className="brand-text">
          <strong>ENVISION</strong>
          <span>WEALTH PLANNING</span>
        </div>
      </Link>

      <nav className="blog-main-tabs">
        <NavLink to="/" end>
          Blogs Home
        </NavLink>
        <NavLink to="/all-blogs">All Blogs</NavLink>
        <NavLink to="/video-blogs">Video Blogs</NavLink>
        <NavLink to="/admin/login">Admin</NavLink>
      </nav>
    </div>
  </header>
);

export default PublicBlogHeader;
