import { useEffect } from 'react';

const upsertMeta = (attribute, key, content) => {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  if (!content) {
    element.remove();
    return;
  }

  element.setAttribute('content', content);
};

const upsertNamedMeta = (name, content) => upsertMeta('name', name, content);
const upsertPropertyMeta = (property, content) => upsertMeta('property', property, content);

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

const clearDynamicJsonLd = () => {
  if (typeof document === 'undefined') return;
  const scripts = document.querySelectorAll('script[data-page-meta-jsonld="true"]');
  scripts.forEach((script) => script.remove());
};

const appendDynamicJsonLd = (structuredData) => {
  if (typeof document === 'undefined') return;

  const items = Array.isArray(structuredData) ? structuredData : [structuredData];

  items
    .filter((item) => item && typeof item === 'object')
    .forEach((item) => {
      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-page-meta-jsonld', 'true');
      script.text = JSON.stringify(item);
      document.head.appendChild(script);
    });
};

const resolveCanonicalHref = (canonicalUrl) => {
  const value = String(canonicalUrl || '').trim();
  if (!value || typeof window === 'undefined') return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `${window.location.origin}${value}`;
  return `${window.location.origin}/${value}`;
};

const usePageMeta = ({
  title,
  description,
  canonicalUrl,
  image,
  type = 'website',
  noIndex = false,
  structuredData,
}) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const canonicalHref = resolveCanonicalHref(canonicalUrl);
    const twitterCard = image ? 'summary_large_image' : 'summary';

    if (title) {
      document.title = title;
    }

    upsertNamedMeta('description', description ? String(description) : '');
    upsertNamedMeta('robots', noIndex ? 'noindex,nofollow' : '');
    upsertCanonical(canonicalHref);

    upsertPropertyMeta('og:title', title ? String(title) : '');
    upsertPropertyMeta('og:description', description ? String(description) : '');
    upsertPropertyMeta('og:type', type ? String(type) : 'website');
    upsertPropertyMeta('og:url', canonicalHref);
    upsertPropertyMeta('og:image', image ? String(image) : '');

    upsertNamedMeta('twitter:card', twitterCard);
    upsertNamedMeta('twitter:title', title ? String(title) : '');
    upsertNamedMeta('twitter:description', description ? String(description) : '');
    upsertNamedMeta('twitter:image', image ? String(image) : '');

    clearDynamicJsonLd();
    appendDynamicJsonLd(structuredData);
  }, [canonicalUrl, description, image, noIndex, structuredData, title, type]);
};

export default usePageMeta;
