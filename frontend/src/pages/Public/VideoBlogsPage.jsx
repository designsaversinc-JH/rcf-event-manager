import React, { useEffect, useState } from 'react';
import PublicBlogHeader from '../../components/public/PublicBlogHeader';
import PublicBlogFooter from '../../components/public/PublicBlogFooter';
import BlogListSection from '../../components/public/BlogListSection';
import { fetchLanding } from '../../api/public';
import { getPageContent } from '../../utils/pageContent';
import usePageMeta from '../../hooks/usePageMeta';

const VideoBlogsPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ blogs: [], categories: [], tags: [], settings: null });
  const pageContent = getPageContent(data.settings, 'video_blogs');

  usePageMeta({
    title: pageContent.meta_title || `${data.settings?.site_title || 'Envision Wealth Planning'} | Video Blogs`,
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
    return <div className="page-loading">Loading videos...</div>;
  }

  return (
    <div className="public-page compact-public">
      <PublicBlogHeader settings={data.settings} />
      <section className="hero compact-hero small-hero">
        <div className="hero-content compact-hero-content">
          <h1>{pageContent.title || 'Video Blogs'}</h1>
          <p>{pageContent.subtext || 'Watch planning insights and advisor walkthroughs.'}</p>
        </div>
      </section>

      <main className="landing-main compact-main">
        <BlogListSection
          blogs={data.blogs || []}
          categories={data.categories || []}
          tags={data.tags || []}
          mode="video"
          staggered
        />
      </main>

      <PublicBlogFooter settings={data.settings} />
    </div>
  );
};

export default VideoBlogsPage;
