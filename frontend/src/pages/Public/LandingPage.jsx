import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicBlogHeader from '../../components/public/PublicBlogHeader';
import PublicBlogFooter from '../../components/public/PublicBlogFooter';
import EmptyList from '../../components/public/EmptyList';
import { fetchLanding } from '../../api/public';
import { getPageContent } from '../../utils/pageContent';
import usePageMeta from '../../hooks/usePageMeta';
import { BRAND_NAME, BRAND_SEO_IMAGE_FALLBACK } from '../../config/branding';

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
    navigation: [],
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
  const canonicalPath = landingPageContent.canonical_url || '/';
  const canonicalHref = useMemo(() => {
    if (typeof window === 'undefined') return canonicalPath;
    if (/^https?:\/\//i.test(canonicalPath)) return canonicalPath;
    return `${window.location.origin}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
  }, [canonicalPath]);
  const websiteTitle = data.settings?.site_title || BRAND_NAME;
  const seoImage = data.settings?.public_logo_url || BRAND_SEO_IMAGE_FALLBACK;

  const structuredData = useMemo(
    () => ([
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: websiteTitle,
        url: canonicalHref,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: BRAND_NAME,
        url: canonicalHref,
        logo: seoImage,
      },
    ]),
    [canonicalHref, seoImage, websiteTitle]
  );

  usePageMeta({
    title: landingPageContent.meta_title || websiteTitle,
    description: landingPageContent.meta_description,
    canonicalUrl: canonicalPath,
    image: seoImage,
    structuredData,
  });

  if (loading) {
    return <div className="page-loading">Loading events...</div>;
  }

  return (
    <div className="public-page compact-public">
      <PublicBlogHeader settings={data.settings} navigation={data.navigation || []} />

      <section className="hero compact-hero">
        <div className="hero-content compact-hero-content">
          <h1>{landingPageContent.title || data.settings?.hero_title || 'Welcome to Roseland Ceasefire'}</h1>
          <p>{landingPageContent.subtext || data.settings?.hero_subtitle || 'Community-first events, updates, and resources from Roseland.'}</p>
        </div>
      </section>

      <main className="landing-main compact-main">
        <div className="section-title-row">
          <h2>{landingPageContent.section_title || 'Recent Events'}</h2>
          <p>{landingPageContent.section_subtext || 'Latest event highlights from the team.'}</p>
        </div>
        <section className="landing-simple-section">
          {latest.length ? (
            <div className="landing-simple-grid">
              {latest.map((blog) => (
                <article key={blog.id} className="blog-card compact-card">
                  {blog.coverImg ? (
                    <div className="card-image-wrap">
                      <img src={blog.coverImg} alt={blog.title} loading="lazy" decoding="async" />
                    </div>
                  ) : null}
                  <div className="blog-card-body">
                    <p className="meta">
                      {blog.category || 'General'} * {formatDate(blog.publishDate)}
                    </p>
                    <h3>{blog.title}</h3>
                    <p>{blog.summary || 'View this event update for details and next steps.'}</p>
                    <div className="card-footer">
                      <Link to={`/blogs/${blog.blogURL || blog.id}`} className="card-cta">
                        {blog.blogType === 'video' ? 'Watch now' : 'View details'}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyList
              title="No events available"
              description="Events will appear here once they are published."
            />
          )}
        </section>
      </main>

      <PublicBlogFooter settings={data.settings} navigation={data.navigation || []} />
    </div>
  );
};

export default LandingPage;
