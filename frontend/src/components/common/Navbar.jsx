import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => (
  <header className="navbar">
    <div className="container navbar__content">
      <Link to="/" className="navbar__brand">
        <span className="navbar__logo">BlogFlow</span>
      </Link>
      <nav className="navbar__nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `navbar__link${isActive ? ' navbar__link--active' : ''}`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/admin/login"
          className={({ isActive }) =>
            `navbar__link${isActive ? ' navbar__link--active' : ''}`
          }
        >
          Admin
        </NavLink>
      </nav>
    </div>
  </header>
);

export default Navbar;
