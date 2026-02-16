import { useEffect } from 'react';

const upsertMeta = (name, content) => {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(`meta[name="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }

  if (!content) {
    element.remove();
    return;
  }

  element.setAttribute('content', content);
};

const upsertCanonical = (href) => {
  if (typeof document === 'undefined') return;
  let element = document.querySelector('link[rel="canonical"]');

  if (!href) {
    if (element) element.remove();
    return;
  }

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
};

const resolveCanonicalHref = (canonicalUrl) => {
  const value = String(canonicalUrl || '').trim();
  if (!value || typeof window === 'undefined') return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `${window.location.origin}${value}`;
  return `${window.location.origin}/${value}`;
};

const usePageMeta = ({ title, description, canonicalUrl }) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (title) {
      document.title = title;
    }

    upsertMeta('description', description ? String(description) : '');
    upsertCanonical(resolveCanonicalHref(canonicalUrl));
  }, [canonicalUrl, description, title]);
};

export default usePageMeta;
