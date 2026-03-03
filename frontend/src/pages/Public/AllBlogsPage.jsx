import React, { useEffect, useState } from 'react';
import PublicBlogHeader from '../../components/public/PublicBlogHeader';
import PublicBlogFooter from '../../components/public/PublicBlogFooter';
import BlogListSection from '../../components/public/BlogListSection';
import { fetchLanding } from '../../api/public';
import { getPageContent } from '../../utils/pageContent';
import usePageMeta from '../../hooks/usePageMeta';
import { BRAND_NAME, BRAND_SEO_IMAGE_FALLBACK } from '../../config/branding';

const AllBlogsPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ blogs: [], categories: [], tags: [], settings: null, navigation: [] });
  const pageContent = getPageContent(data.settings, 'all_blogs');
  const canonicalPath = pageContent.canonical_url || '/all-blogs';
  const seoImage = data.settings?.public_logo_url || BRAND_SEO_IMAGE_FALLBACK;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageContent.meta_title || `${data.settings?.site_title || BRAND_NAME} | All Events`,
    description: pageContent.meta_description,
    url: canonicalPath,
  };

  usePageMeta({
    title: pageContent.meta_title || `${data.settings?.site_title || BRAND_NAME} | All Events`,
    description: pageContent.meta_description,
    canonicalUrl: canonicalPath,
    image: seoImage,
    structuredData,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchLanding();
        setData(response.data || {});
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="page-loading">Loading events...</div>;
  }

  return (
    <div className="public-page compact-public">
      <PublicBlogHeader settings={data.settings} navigation={data.navigation || []} />
      <section className="hero compact-hero small-hero">
        <div className="hero-content compact-hero-content">
          <h1>{pageContent.title || 'All Events'}</h1>
          <p>{pageContent.subtext || 'Browse event updates and video highlights.'}</p>
        </div>
      </section>

      <main className="landing-main compact-main">
        <BlogListSection
          blogs={data.blogs || []}
          categories={data.categories || []}
          tags={data.tags || []}
          mode="all"
          staggered
          paginated
          pageSize={9}
        />
      </main>

      <PublicBlogFooter settings={data.settings} navigation={data.navigation || []} />
    </div>
  );
};

export default AllBlogsPage;
