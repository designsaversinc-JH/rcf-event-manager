import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchAdminBlog } from '../../api/admin';
import usePageMeta from '../../hooks/usePageMeta';

const stripScripts = (html) =>
  String(html || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');

const extractIframeSrc = (value) => {
  const match = String(value || '').match(/<iframe[^>]*src=["']([^"']+)["']/i);
  return match ? match[1] : null;
};

const extractYouTubeId = (raw) => {
  if (!raw) return null;
  const source = extractIframeSrc(raw) || String(raw).trim();

  try {
    const parsed = new URL(source);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('youtu.be')) {
      return parsed.pathname.replace('/', '').trim() || null;
    }

    if (host.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/embed/')[1] || null;
      }

      if (parsed.pathname.startsWith('/watch')) {
        return parsed.searchParams.get('v');
      }
    }
  } catch (_error) {
    // Ignore parse errors.
  }

  const looseMatch = String(source).match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/i
  );

  return looseMatch?.[1] || null;
};

const normalizeYouTubeUrl = (raw) => {
  const id = extractYouTubeId(raw);
  return id ? `https://www.youtube.com/embed/${id}` : null;
};

const PostViewPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState(null);

  usePageMeta({
    title: blog?.title ? `${blog.title} | Admin View` : 'View Event | Roseland Ceasefire',
    description: blog?.summary || 'Preview event details in the admin dashboard.',
    canonicalUrl: `/admin/posts/${id}/view`,
    image: blog?.coverImg || '',
    type: blog?.blogType === 'video' ? 'video.other' : 'article',
    noIndex: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchAdminBlog(id);
        setBlog(response.data || null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const embeddedVideoUrl = useMemo(() => {
    if (!blog) return null;
    return normalizeYouTubeUrl(blog.vlogEmbed) || normalizeYouTubeUrl(blog.vlogURL);
  }, [blog]);

  if (loading) {
    return <div className="page-loading">Loading event details...</div>;
  }

  if (!blog) {
    return (
      <section className="admin-section">
        <h2>Event not found</h2>
        <Link className="table-link-btn" to="/admin/posts">Back to events</Link>
      </section>
    );
  }

  return (
    <section className="admin-section">
      <div className="page-title-row">
        <div>
          <h2>{blog.title}</h2>
          <p className="section-subtle">
            {blog.blogType} • {blog.status} • {blog.category || 'General'}
          </p>
        </div>
        <div className="table-actions">
          <Link className="table-link-btn" to={`/admin/posts/${blog.id}/edit`}>Edit</Link>
          <Link className="mode-switch" to="/admin/posts">Back</Link>
        </div>
      </div>

      <article className="detail-main">
        {blog.coverImg ? <img className="detail-cover" src={blog.coverImg} alt={blog.title} /> : null}
        {blog.summary ? <p className="detail-summary">{blog.summary}</p> : null}

        {blog.blogType === 'video' && embeddedVideoUrl ? (
          <div className="video-wrap">
            <iframe
              title={blog.title}
              src={embeddedVideoUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}

        {blog.blogType === 'video' && !embeddedVideoUrl && blog.vlogURL ? (
          <video className="video-file-player" src={blog.vlogURL} controls preload="metadata" />
        ) : null}

        <div
          className="detail-content rich-html"
          dangerouslySetInnerHTML={{
            __html: stripScripts(blog.content || blog.vlogContent || ''),
          }}
        />
      </article>
    </section>
  );
};

export default PostViewPage;
