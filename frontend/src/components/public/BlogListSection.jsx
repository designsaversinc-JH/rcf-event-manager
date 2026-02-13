import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const formatDate = (value) => {
  if (!value) return 'Unscheduled';
  return new Date(value).toLocaleDateString();
};

const BlogListSection = ({ blogs = [], categories = [], tags = [], mode = 'all' }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');

  const filtered = useMemo(() => {
    return blogs.filter((blog) => {
      if (mode === 'video' && String(blog.blogType || '').toLowerCase() !== 'video') {
        return false;
      }

      if (selectedCategory !== 'all' && String(blog.category || '').toLowerCase() !== selectedCategory) {
        return false;
      }

      if (
        selectedTag !== 'all' &&
        !(blog.blogTags || []).some((tag) => String(tag).toLowerCase() === selectedTag)
      ) {
        return false;
      }

      return true;
    });
  }, [blogs, mode, selectedCategory, selectedTag]);

  return (
    <section className="content-section compact-content">
      <div className="blog-filters compact-filters">
        <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.name).toLowerCase()}>
              {category.name}
            </option>
          ))}
        </select>

        <select value={selectedTag} onChange={(event) => setSelectedTag(event.target.value)}>
          <option value="all">All Tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={String(tag.name).toLowerCase()}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      <div className="blog-grid compact-grid">
        {filtered.map((blog) => (
          <article key={blog.id} className="blog-card compact-card">
            <img src={blog.coverImg || 'https://placehold.co/1200x700?text=Blog'} alt={blog.title} />
            <div className="blog-card-body">
              <p className="meta">
                {blog.blogType} • {formatDate(blog.publishDate)}
              </p>
              <h3>{blog.title}</h3>
              <p>{blog.summary}</p>
              <Link to={`/blogs/${blog.blogURL || blog.id}`}>Read more</Link>
            </div>
          </article>
        ))}
      </div>

      {!filtered.length ? <p className="empty-state">No blogs match this filter.</p> : null}
    </section>
  );
};

export default BlogListSection;
