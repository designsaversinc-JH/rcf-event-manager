import React from 'react';
import { Link } from 'react-router-dom';
import {
  BRAND_LOGO_FALLBACK,
  BRAND_MAIN_SITE_URL,
  BRAND_NAME,
} from '../../config/branding';

const isInternalHref = (href) => String(href || '').trim().startsWith('/');

const PublicBlogFooter = ({ settings, navigation = [] }) => {
  const footerLinks = (Array.isArray(navigation) ? navigation : [])
    .filter((item) => item && item.visible !== false && String(item.label || '').trim())
    .map((item) => ({
      id: item.id || item.label,
      label: item.label,
      href: String(item.href || '').trim() || '/',
    }));

  const SocialIcon = ({ name }) => {
    const paths = {
      facebook:
        'M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v5h3v-5h2.2l.8-3H13V9c0-.6.4-1 1-1z',
      linkedin:
        'M7.8 8.8A1.8 1.8 0 116 7a1.8 1.8 0 011.8 1.8zM6.2 10.2h3.1V18H6.2v-7.8zm4.4 0h3v1.1h.1c.4-.7 1.3-1.3 2.6-1.3 2.8 0 3.3 1.8 3.3 4.2V18h-3.1v-3.5c0-.8 0-1.9-1.2-1.9s-1.3.9-1.3 1.8V18h-3.1v-7.8z',
      youtube:
        'M20.5 9.8c-.2-1-1-1.8-2-2-1.8-.3-4.5-.3-6.5-.3s-4.7 0-6.5.3c-1 .2-1.8 1-2 2-.3 1.8-.3 3.6 0 5.4.2 1 1 1.8 2 2 1.8.3 4.5.3 6.5.3s4.7 0 6.5-.3c1-.2 1.8-1 2-2 .3-1.8.3-3.6 0-5.4zM10.3 15V9l5 3-5 3z',
      bluesky:
        'M8.2 8.2c1.4 1 2.9 3 3.8 4.9.9-1.9 2.4-3.9 3.8-4.9 1-.7 2.6-1.3 2.6.5 0 .4-.2 3.1-.3 3.6-.4 1.8-1.8 2.2-3.1 2l2 .4c1.6.3 2 .9 1.2 2.4-1.6 2.8-4.7 2.4-7.1-.4-2.4 2.8-5.5 3.2-7.1.4-.8-1.5-.4-2.1 1.2-2.4l2-.4c-1.3.2-2.7-.2-3.1-2C5.1 11.8 4.9 9.1 4.9 8.7c0-1.8 1.6-1.2 2.6-.5z',
    };

    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="footer-social-icon">
        <path d={paths[name]} />
      </svg>
    );
  };

  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        <a href={BRAND_MAIN_SITE_URL} target="_blank" rel="noreferrer" className="footer-brand-link">
          <img
            src={settings?.public_logo_url || BRAND_LOGO_FALLBACK}
            alt={BRAND_NAME}
            className="footer-logo"
            loading="lazy"
            decoding="async"
          />
        </a>

        <nav className="footer-nav-links">
          {footerLinks.map((item) =>
            isInternalHref(item.href) ? (
              <Link key={item.id} to={item.href}>
                {item.label}
              </Link>
            ) : (
              <a key={item.id} href={item.href} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            )
          )}
          <Link to="/admin/login" className="footer-admin-link">Admin</Link>
        </nav>

        <div className="footer-social">
          <a href={BRAND_MAIN_SITE_URL} target="_blank" rel="noreferrer" aria-label={BRAND_NAME}>
            <SocialIcon name="facebook" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default PublicBlogFooter;
