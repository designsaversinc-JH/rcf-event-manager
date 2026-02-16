import React from 'react';
import { NavLink } from 'react-router-dom';

const LOGO_URL =
  'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/evision-wealth-bog-management-5fsiev/assets/67rajg4nyg8i/EW_Logo2022-01-1-1200x282.png';
const MAIN_SITE_URL = 'https://envisionwealth.us/';

const isInternalHref = (href) => String(href || '').trim().startsWith('/');

const PublicBlogHeader = ({ settings, navigation = [] }) => {
  const navItems = (Array.isArray(navigation) ? navigation : []).filter(
    (item) => item && item.visible !== false && String(item.label || '').trim()
  );

  return (
    <header className="blog-topbar">
      <div className="blog-topbar-inner">
        <a href={MAIN_SITE_URL} target="_blank" rel="noreferrer" className="brand-logo-link">
          <img
            src={settings?.public_logo_url || LOGO_URL}
            alt="Envision Wealth Planning"
            className="brand-logo-img"
          />
        </a>

        {navItems.length ? (
          <nav className="blog-main-tabs">
            {navItems.map((item) =>
              isInternalHref(item.href) ? (
                <NavLink key={item.id || `${item.label}-${item.href}`} to={item.href} end={item.href === '/'}>
                  {item.label}
                </NavLink>
              ) : (
                <a
                  key={item.id || `${item.label}-${item.href}`}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.label}
                </a>
              )
            )}
          </nav>
        ) : null}
      </div>
    </header>
  );
};

export default PublicBlogHeader;
