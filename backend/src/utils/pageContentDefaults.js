const DEFAULT_PAGE_CONTENT = {
  landing: {
    title: 'Building Safety, Trust, and Opportunity in Roseland.',
    subtext: 'Community-led stories, updates, and resources from Roseland Ceasefire.',
    section_title: 'Recent Posts',
    section_subtext: 'Latest updates from the Roseland Ceasefire team.',
    meta_title: 'Roseland Ceasefire',
    meta_description: 'Community updates, resources, and stories from Roseland Ceasefire.',
    canonical_url: '/',
  },
  all_blogs: {
    title: 'All Blogs',
    subtext: 'Explore articles and video updates from Roseland Ceasefire.',
    meta_title: 'All Blogs | Roseland Ceasefire',
    meta_description: 'Explore all posts and videos from Roseland Ceasefire.',
    canonical_url: '/all-blogs',
  },
  video_blogs: {
    title: 'Video Blogs',
    subtext: 'Watch interviews, event recaps, and community messages.',
    meta_title: 'Video Blogs | Roseland Ceasefire',
    meta_description: 'Watch the latest Roseland Ceasefire videos.',
    canonical_url: '/video-blogs',
  },
};

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normalizeValue = (value, fallback) => {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
};

const normalizePageContent = (input) => {
  const raw = isRecord(input) ? input : {};

  return Object.entries(DEFAULT_PAGE_CONTENT).reduce((acc, [pageKey, defaults]) => {
    const rawPage = isRecord(raw[pageKey]) ? raw[pageKey] : {};
    const normalizedPage = Object.entries(defaults).reduce((pageAcc, [fieldKey, fieldDefault]) => {
      pageAcc[fieldKey] = normalizeValue(rawPage[fieldKey], fieldDefault);
      return pageAcc;
    }, {});

    acc[pageKey] = normalizedPage;
    return acc;
  }, {});
};

module.exports = {
  DEFAULT_PAGE_CONTENT,
  normalizePageContent,
};
