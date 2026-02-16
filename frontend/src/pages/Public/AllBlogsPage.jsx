import React, { useEffect, useState } from 'react';
import PublicBlogHeader from '../../components/public/PublicBlogHeader';
import PublicBlogFooter from '../../components/public/PublicBlogFooter';
import BlogListSection from '../../components/public/BlogListSection';
import { fetchLanding } from '../../api/public';
import { getPageContent } from '../../utils/pageContent';
import usePageMeta from '../../hooks/usePageMeta';

const AllBlogsPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ blogs: [], categories: [], tags: [], settings: null, navigation: [] });
  const pageContent = getPageContent(data.settings, 'all_blogs');

  usePageMeta({
    title: pageContent.meta_title || `${data.settings?.site_title || 'Envision Wealth Planning'} | All Blogs`,
    description: pageContent.meta_description,
    canonicalUrl: pageContent.canonical_url,
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
    return <div className="page-loading">Loading blogs...</div>;
  }

  return (
    <div className="public-page compact-public">
      <PublicBlogHeader settings={data.settings} navigation={data.navigation || []} />
      <section className="hero compact-hero small-hero">
        <div className="hero-content compact-hero-content">
          <h1>{pageContent.title || 'All Blogs'}</h1>
          <p>{pageContent.subtext || 'Staggered feed of article and video cards.'}</p>
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
