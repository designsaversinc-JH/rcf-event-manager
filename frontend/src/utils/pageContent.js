export const DEFAULT_PAGE_CONTENT = {
  landing: {
    title: 'Align Your Investments & Retirement Plans With What Matters to You.',
    subtext: 'Thoughtful planning, practical action, and clear communication for every chapter.',
    section_title: 'Recent Posts',
    section_subtext: 'Latest 3 insights from the editorial desk.',
    meta_title: 'Envision Wealth Planning',
    meta_description: 'Strategic guidance and practical insight for families and businesses.',
    canonical_url: '/',
  },
  all_blogs: {
    title: 'All Blogs',
    subtext: 'Staggered feed of article and video cards.',
    meta_title: 'All Blogs | Envision Wealth Planning',
    meta_description: 'Explore all blog posts and videos from Envision Wealth Planning.',
    canonical_url: '/all-blogs',
  },
  video_blogs: {
    title: 'Video Blogs',
    subtext: 'Watch planning insights and advisor walkthroughs.',
    meta_title: 'Video Blogs | Envision Wealth Planning',
    meta_description: 'Watch the latest planning and wealth strategy video insights.',
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
