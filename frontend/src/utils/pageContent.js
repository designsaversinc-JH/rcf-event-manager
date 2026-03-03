export const DEFAULT_PAGE_CONTENT = {
  landing: {
    title: 'Building Safety, Trust, and Opportunity in Roseland.',
    subtext: 'Community-led events, updates, and resources from Roseland Ceasefire.',
    section_title: 'Recent Events',
    section_subtext: 'Latest event updates from the Roseland Ceasefire team.',
    meta_title: 'Roseland Ceasefire',
    meta_description: 'Community events, updates, and resources from Roseland Ceasefire.',
    canonical_url: '/',
  },
  all_blogs: {
    title: 'All Events',
    subtext: 'Explore event recaps, announcements, and video updates from Roseland Ceasefire.',
    meta_title: 'All Events | Roseland Ceasefire',
    meta_description: 'Explore all event updates and videos from Roseland Ceasefire.',
    canonical_url: '/all-blogs',
  },
  video_blogs: {
    title: 'Video Events',
    subtext: 'Watch interviews, event recaps, and community messages.',
    meta_title: 'Video Events | Roseland Ceasefire',
    meta_description: 'Watch the latest Roseland Ceasefire videos.',
    canonical_url: '/video-blogs',
  },
};

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normalizeValue = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

export const normalizePageContent = (rawValue) => {
  const raw = isObject(rawValue) ? rawValue : {};

  return Object.entries(DEFAULT_PAGE_CONTENT).reduce((acc, [pageKey, defaults]) => {
    const currentPage = isObject(raw[pageKey]) ? raw[pageKey] : {};
    const normalizedPage = Object.entries(defaults).reduce((pageAcc, [fieldKey, fieldDefault]) => {
      pageAcc[fieldKey] = normalizeValue(currentPage[fieldKey], fieldDefault);
      return pageAcc;
    }, {});

    acc[pageKey] = normalizedPage;
    return acc;
  }, {});
};

export const getAllPageContent = (settings) => normalizePageContent(settings?.page_content);

export const getPageContent = (settings, pageKey) => {
  const pageContent = getAllPageContent(settings);
  return pageContent[pageKey] || {};
};
