import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PublicBlogHeader from '../../components/public/PublicBlogHeader';
import { fetchLanding, fetchPublicBlog } from '../../api/public';

const PostDetailPage = () => {
  const { identifier } = useParams();
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [blogRes, landingRes] = await Promise.all([
          fetchPublicBlog(identifier),
          fetchLanding(),
        ]);
        setBlog(blogRes.data || null);
        setAllBlogs(landingRes.data?.blogs || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [identifier]);

  const related = useMemo(() => {
    if (!blog) return [];

    const category = String(blog.category || '').toLowerCase();
    const tagSet = new Set((blog.blogTags || []).map((tag) => String(tag).toLowerCase()));

    return allBlogs
      .filter((item) => item.id !== blog.id)
      .filter((item) => {
        const sameCategory = category && String(item.category || '').toLowerCase() === category;
        const sharesTag = (item.blogTags || []).some((tag) => tagSet.has(String(tag).toLowerCase()));
        return sameCategory || sharesTag;
      })
      .slice(0, 4);
  }, [allBlogs, blog]);

  const shareLinks = useMemo(() => {
    if (typeof window === 'undefined' || !blog) {
      return { email: '#', linkedin: '#', x: '#' };
    }

    const url = window.location.href;
    const subject = encodeURIComponent(blog.title);
    const body = encodeURIComponent(`Check out this blog: ${url}`);
    const linkedInUrl = encodeURIComponent(url);
    const xText = encodeURIComponent(`${blog.title} ${url}`);

    return {
      email: `mailto:?subject=${subject}&body=${body}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${linkedInUrl}`,
      x: `https://twitter.com/intent/tweet?text=${xText}`,
    };
  }, [blog]);

  if (loading) {
    return <div className="page-loading">Loading blog...</div>;
  }

  if (!blog) {
    return (
      <div className="detail-page">
        <h1>Blog not found</h1>
        <Link to="/">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="public-page compact-public">
      <PublicBlogHeader />
      <article className="detail-page rich-detail">
        <div className="detail-main">
          <Link to="/all-blogs" className="detail-back">
            ← Back to all blogs
          </Link>
          <h1>{blog.title}</h1>
          <p className="meta">
            {blog.author || 'Envision Team'} • {blog.blogType} • {blog.category || 'General'}
          </p>

          {blog.coverImg ? <img className="detail-cover" src={blog.coverImg} alt={blog.title} /> : null}

          {blog.blogType === 'video' && blog.vlogEmbed ? (
            <div className="video-wrap">
              <iframe
                title={blog.title}
                src={blog.vlogEmbed}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : null}

          {blog.blogType === 'video' && !blog.vlogEmbed && blog.vlogURL ? (
            <video className="video-file-player" src={blog.vlogURL} controls preload="metadata" />
          ) : null}

          <p className="detail-summary">{blog.summary}</p>
          <div className="detail-content">{blog.content || blog.vlogContent}</div>
        </div>

        <aside className="detail-sidebar">
          <section className="share-box">
            <h3>Share</h3>
            <div className="share-links">
              <a href={shareLinks.email}>Email</a>
              <a href={shareLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              <a href={shareLinks.x} target="_blank" rel="noreferrer">X</a>
            </div>
          </section>

          <section className="related-box">
            <h3>Related Articles</h3>
            <div className="related-list">
              {related.map((item) => (
                <Link key={item.id} to={`/blogs/${item.blogURL || item.id}`} className="related-item">
                  <strong>{item.title}</strong>
                  <span>{item.category || 'General'}</span>
                </Link>
              ))}
              {!related.length ? <p className="empty-state">No related items yet.</p> : null}
            </div>
          </section>
        </aside>
      </article>
    </div>
  );
};

export default PostDetailPage;
