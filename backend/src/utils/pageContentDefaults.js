const DEFAULT_PAGE_CONTENT = {
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
