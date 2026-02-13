import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPublicBlog } from '../../api/public';

const PostDetailPage = () => {
  const { identifier } = useParams();
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchPublicBlog(identifier);
        setBlog(response.data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [identifier]);

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
    <article className="detail-page">
      <Link to="/">← Back to landing page</Link>
      <h1>{blog.title}</h1>
      <p className="meta">{blog.author} • {blog.blogType}</p>
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

      <p>{blog.summary}</p>
      <div className="detail-content">{blog.content || blog.vlogContent}</div>
    </article>
  );
};

export default PostDetailPage;
