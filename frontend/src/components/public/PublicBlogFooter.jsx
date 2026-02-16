import React from 'react';
import { Link } from 'react-router-dom';

const LOGO_URL =
  'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/evision-wealth-bog-management-5fsiev/assets/67rajg4nyg8i/EW_Logo2022-01-1-1200x282.png';

const normalizeMainSite = (raw) => {
  const value = String(raw || '').trim();
  if (!value || value.startsWith('/')) {
    return 'https://envisionwealthplanning.com';
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  return `https://${value}`;
};

const PublicBlogFooter = ({ settings }) => {
  const mainWebsiteUrl = normalizeMainSite(settings?.primary_cta_href);

  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        <a href={mainWebsiteUrl} target="_blank" rel="noreferrer" className="footer-brand-link">
          <img
            src={settings?.public_logo_url || LOGO_URL}
            alt="Envision Wealth Planning"
            className="footer-logo"
          />
        </a>

        <nav className="footer-nav-links">
          <a href={mainWebsiteUrl} target="_blank" rel="noreferrer">Blog&apos;s Home</a>
          <a href={`${mainWebsiteUrl}/our-difference`} target="_blank" rel="noreferrer">Our Difference</a>
          <a href={`${mainWebsiteUrl}/our-team`} target="_blank" rel="noreferrer">Our Team</a>
          <a href={`${mainWebsiteUrl}/contact`} target="_blank" rel="noreferrer">Contact</a>
          <Link to="/admin/login" className="footer-admin-link">Admin</Link>
        </nav>

        <div className="footer-social">
          <a href="https://www.facebook.com/envisionwealth" target="_blank" rel="noreferrer" aria-label="Facebook">FB</a>
          <a href="https://www.linkedin.com/company/envisionwealth" target="_blank" rel="noreferrer" aria-label="LinkedIn">IN</a>
          <a href="https://www.youtube.com/@envisionwealthplanningchic2051" target="_blank" rel="noreferrer" aria-label="YouTube">YT</a>
          <a href="https://bsky.app/profile/envisionwealth.bsky.social" target="_blank" rel="noreferrer" aria-label="Bluesky">BS</a>
        </div>
      </div>
    </footer>
  );
};

export default PublicBlogFooter;
