import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicBlogHeader from '../../components/public/PublicBlogHeader';
import PublicBlogFooter from '../../components/public/PublicBlogFooter';
import { fetchLanding } from '../../api/public';
import { getPageContent } from '../../utils/pageContent';
import usePageMeta from '../../hooks/usePageMeta';

const formatDate = (value) => {
  if (!value) return 'Unscheduled';
  return new Date(value).toLocaleDateString();
};

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
  const landingPageContent = useMemo(() => getPageContent(data.settings, 'landing'), [data.settings]);

  usePageMeta({
    title: landingPageContent.meta_title || data.settings?.site_title || 'Envision Wealth Planning',
    description: landingPageContent.meta_description,
    canonicalUrl: landingPageContent.canonical_url,
  });

  if (loading) {
    return <div className="page-loading">Loading blogs...</div>;
  }

  return (
    <div className="public-page compact-public">
      <PublicBlogHeader settings={data.settings} />

      <section className="hero compact-hero">
        <div className="hero-content compact-hero-content">
          <h1>{landingPageContent.title || data.settings?.hero_title || 'Welcome to Envision Blogs'}</h1>
          <p>{landingPageContent.subtext || data.settings?.hero_subtitle || 'Tool and strategies modern teams need to help their companies grow.'}</p>
        </div>
      </section>

      <main className="landing-main compact-main">
        <div className="section-title-row">
          <h2>{landingPageContent.section_title || 'Recent Posts'}</h2>
          <p>{landingPageContent.section_subtext || 'Latest 3 insights from the editorial desk.'}</p>
        </div>
        <section className="landing-simple-section">
          <div className="landing-simple-grid">
            {latest.map((blog) => (
              <article key={blog.id} className="blog-card compact-card">
                {blog.coverImg ? (
                  <div className="card-image-wrap">
                    <img src={blog.coverImg} alt={blog.title} />
                  </div>
                ) : null}
                <div className="blog-card-body">
                  <p className="meta">
                    {blog.category || 'General'} * {formatDate(blog.publishDate)}
                  </p>
                  <h3>{blog.title}</h3>
                  <p>{blog.summary || 'Read this post for details and insights.'}</p>
                  <div className="card-footer">
                    <Link to={`/blogs/${blog.blogURL || blog.id}`} className="card-cta">
                      {blog.blogType === 'video' ? 'Watch now' : 'Read article'}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <PublicBlogFooter settings={data.settings} />
    </div>
  );
};

export default LandingPage;
