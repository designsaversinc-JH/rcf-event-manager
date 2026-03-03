import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BRAND_LOGO_FALLBACK,
  BRAND_MAIN_SITE_URL,
  BRAND_NAME,
} from '../../config/branding';

const isInternalHref = (href) => String(href || '').trim().startsWith('/');

const PublicBlogHeader = ({ settings, navigation = [] }) => {
  const navItems = (Array.isArray(navigation) ? navigation : []).filter(
    (item) => item && item.visible !== false && String(item.label || '').trim()
  );

  return (
    <header className="blog-topbar">
      <div className="blog-topbar-inner">
        <a href={BRAND_MAIN_SITE_URL} target="_blank" rel="noreferrer" className="brand-logo-link">
          <img
            src={settings?.public_logo_url || BRAND_LOGO_FALLBACK}
            alt={BRAND_NAME}
            className="brand-logo-img"
            loading="eager"
            decoding="async"
            fetchPriority="high"
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
