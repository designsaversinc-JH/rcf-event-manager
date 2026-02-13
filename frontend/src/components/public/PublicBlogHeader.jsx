import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const LOGO_URL =
  'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/evision-wealth-bog-management-5fsiev/assets/67rajg4nyg8i/EW_Logo2022-01-1-1200x282.png';

const PublicBlogHeader = () => (
  <header className="blog-topbar">
    <div className="blog-topbar-inner">
      <Link to="/" className="brand-logo-link">
        <img src={LOGO_URL} alt="Envision Wealth Planning" className="brand-logo-img" />
      </Link>

      <nav className="blog-main-tabs">
        <NavLink to="/" end>
          Blogs Home
        </NavLink>
        <NavLink to="/all-blogs">All Blogs</NavLink>
        <NavLink to="/video-blogs">Video Blogs</NavLink>
      </nav>
    </div>
  </header>
);

export default PublicBlogHeader;
