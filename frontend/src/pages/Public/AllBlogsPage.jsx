import React, { useEffect, useState } from 'react';
import PublicBlogHeader from '../../components/public/PublicBlogHeader';
import BlogListSection from '../../components/public/BlogListSection';
import { fetchLanding } from '../../api/public';

const AllBlogsPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ blogs: [], categories: [], tags: [] });

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
      <PublicBlogHeader />
      <section className="hero compact-hero small-hero">
        <div className="hero-content compact-hero-content">
          <h1>All Blogs</h1>
          <p>Staggered feed of article and video cards.</p>
        </div>
      </section>

      <main className="landing-main compact-main">
        <BlogListSection
          blogs={data.blogs || []}
          categories={data.categories || []}
          tags={data.tags || []}
          mode="all"
          staggered
        />
      </main>
    </div>
  );
};

export default AllBlogsPage;
