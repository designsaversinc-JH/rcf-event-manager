import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/format';

const PostCard = ({ post }) => {
  const categories = Array.isArray(post.categories) ? post.categories : [];
  const identifier = post.slug || post.id;

  return (
    <article className="post-card">
      <div className="post-card__meta">
        <span>{formatDate(post.publishedAt)}</span>
        {categories.map((category) => (
          <span key={category.id} className="chip">
            {category.name}
          </span>
        ))}
        {post.isFeatured && <span className="chip">Featured</span>}
      </div>
      <Link to={`/posts/${identifier}`}>
        <h3>{post.title}</h3>
      </Link>
      {post.excerpt && <p>{post.excerpt}</p>}
      <div className="post-card__meta">
        <span>By {post.authorName || 'Editorial Team'}</span>
      </div>
    </article>
  );
};

export default PostCard;
