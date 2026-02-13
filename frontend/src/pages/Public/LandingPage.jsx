import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLanding } from '../../api/public';

const formatDate = (value) => {
  if (!value) return 'Unscheduled';
  return new Date(value).toLocaleDateString();
};

const LandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    settings: null,
    navigation: [],
    blogs: [],
    jobs: [],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchLanding();
        setData(response.data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const topBlogs = useMemo(() => data.blogs.slice(0, 6), [data.blogs]);

  if (loading) {
    return <div className="page-loading">Loading site...</div>;
  }

  return (
    <div className="public-page">
      <header>
        <div className="top-strip">
          <p>312-448-1010</p>
          <p>{data.settings?.accent_message}</p>
        </div>
        <div className="main-nav-wrap">
          <div className="logo-block">{data.settings?.site_title || 'Blog Site'}</div>
          <nav className="main-nav">
            {data.navigation
              ?.filter((item) => item.visible)
              .map((item) => (
                <a key={item.id} href={item.href}>
                  {item.label}
                </a>
              ))}
            <Link className="schedule-btn" to="/admin/login">
              Admin Login
            </Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>{data.settings?.hero_title}</h1>
          <p>{data.settings?.hero_subtitle}</p>
          <div className="hero-ctas">
            <a href={data.settings?.primary_cta_href}>{data.settings?.primary_cta_label}</a>
            <a className="secondary" href={data.settings?.secondary_cta_href}>
              {data.settings?.secondary_cta_label}
            </a>
          </div>
        </div>
      </section>

      <main className="landing-main">
        <section id="blogs" className="content-section">
          <div className="section-title-row">
            <h2>Latest Insights</h2>
            <p>Written and video blogs managed from your admin dashboard.</p>
          </div>
          <div className="blog-grid">
            {topBlogs.map((blog) => (
              <article key={blog.id} className="blog-card">
                <img src={blog.coverImg || 'https://placehold.co/1200x700?text=Blog'} alt={blog.title} />
                <div className="blog-card-body">
                  <p className="meta">{blog.blogType} • {formatDate(blog.publishDate)}</p>
                  <h3>{blog.title}</h3>
                  <p>{blog.summary}</p>
                  <Link to={`/blogs/${blog.blogURL || blog.id}`}>Read more</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="jobs" className="content-section jobs-section">
          <div className="section-title-row">
            <h2>Open Roles</h2>
            <p>Public job listings your client can update anytime.</p>
          </div>
          <div className="job-list">
            {data.jobs.map((job) => (
              <article key={job.id} className="job-item">
                <h3>{job.title}</h3>
                <p>{job.department} • {job.location}</p>
                <p>{job.summary}</p>
                <a href={job.apply_url} target="_blank" rel="noreferrer">
                  Apply
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
