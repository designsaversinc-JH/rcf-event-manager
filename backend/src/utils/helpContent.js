const HELP_CONTENT = {
  updatedAt: '2026-02-16',
  title: 'Blog Manager Help Center',
  intro:
    'Use this guide to manage navigation, publish blogs, organize taxonomy, and maintain team access in the admin dashboard.',
  quickStart: [
    'Sign in at /admin/login with an approved admin account.',
    'Use Dashboard for a quick status summary.',
    'Create and edit blogs from Blogs.',
    'Control page copy, SEO, navigation, categories, tags, and team access from Settings.',
  ],
  faq: [
    {
      id: 'faq-1',
      question: 'How do I update titles and SEO text on public pages?',
      answer:
        'Go to Settings > Page Content & SEO, update fields for each page, and save. Changes publish immediately.',
    },
    {
      id: 'faq-2',
      question: 'How do I change header and footer links?',
      answer:
        'Go to Settings > Navigation. Add internal links like /all-blogs or external links like https://example.com.',
    },
    {
      id: 'faq-3',
      question: 'How do I create a video blog post?',
      answer:
        'Open Blogs > New Blog, set type to video, provide embed/video details, and publish.',
    },
    {
      id: 'faq-4',
      question: 'How do I control who can access admin pages?',
      answer:
        'Go to Settings > Team & Access to invite users, change roles, disable access, or remove users.',
    },
    {
      id: 'faq-5',
      question: 'Why are my changes not visible right away?',
      answer:
        'Public pages are cached briefly for performance. Saving settings invalidates app cache and updates should appear quickly after refresh.',
    },
  ],
};

const getHelpContent = () => HELP_CONTENT;

module.exports = {
  getHelpContent,
};
