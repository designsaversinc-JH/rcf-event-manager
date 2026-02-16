import React, { useEffect, useMemo, useState } from 'react';
import PublicBlogHeader from '../../components/public/PublicBlogHeader';
import PublicBlogFooter from '../../components/public/PublicBlogFooter';
import BlogListSection from '../../components/public/BlogListSection';
import { fetchLanding } from '../../api/public';

const LandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    blogs: [],
    categories: [],
    tags: [],
    settings: null,
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

  const latest = useMemo(() => {
    return [...(data.blogs || [])].slice(0, 3);
  }, [data.blogs]);

  if (loading) {
    return <div className="page-loading">Loading blogs...</div>;
  }

  return (
    <div className="public-page compact-public">
      <PublicBlogHeader settings={data.settings} />

      <section className="hero compact-hero">
        <div className="hero-content compact-hero-content">
          <h1>Envision&apos;s Blog Articals</h1>
          <p>
            Discover personalized approaches to managing your finances, ensuring peace of mind
            and lasting prosperity
          </p>
        </div>
      </section>

      <main className="landing-main compact-main">
        <div className="section-title-row">
          <h2>Recent Posts</h2>
          <p>Browse recent insights or use the tabs above for full listings.</p>
        </div>
        <BlogListSection
          blogs={latest}
          categories={data.categories || []}
          tags={data.tags || []}
          mode="all"
          staggered
        />
      </main>

      <PublicBlogFooter settings={data.settings} />
    </div>
  );
};

export default LandingPage;
