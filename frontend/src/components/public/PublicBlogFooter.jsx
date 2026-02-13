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
          <img src={LOGO_URL} alt="Envision Wealth Planning" className="footer-logo" />
        </a>

        <nav className="footer-nav-links">
          <a href={mainWebsiteUrl} target="_blank" rel="noreferrer">Blog&apos;s Home</a>
          <a href={`${mainWebsiteUrl}/our-difference`} target="_blank" rel="noreferrer">Our Difference</a>
          <a href={`${mainWebsiteUrl}/our-team`} target="_blank" rel="noreferrer">Our Team</a>
          <a href={`${mainWebsiteUrl}/contact`} target="_blank" rel="noreferrer">Contact</a>
          <Link to="/admin/login" className="footer-admin-link">Admin</Link>
        </nav>

        <div className="footer-social">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">ig</a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">yt</a>
        </div>
      </div>
    </footer>
  );
};

export default PublicBlogFooter;
