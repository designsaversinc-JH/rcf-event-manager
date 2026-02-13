import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyList from './EmptyList';

const VIDEO_PLACEHOLDER_URL =
  'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/envision-wealth-xq36fc/assets/03q1z4ndqvbn/Untitled_(2).jpeg';

const formatDate = (value) => {
  if (!value) return 'Unscheduled';
  return new Date(value).toLocaleDateString();
};

const BlogListSection = ({
  blogs = [],
  categories = [],
  tags = [],
  mode = 'all',
  staggered = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [failedImages, setFailedImages] = useState({});

  const filtered = useMemo(() => {
    return blogs.filter((blog) => {
      if (mode === 'video' && String(blog.blogType || '').toLowerCase() !== 'video') {
        return false;
      }

      if (mode === 'article' && String(blog.blogType || '').toLowerCase() !== 'written') {
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

      {!!filtered.length && (
        <div className={`blog-grid compact-grid ${staggered ? 'stagger-grid' : ''}`}>
          {filtered.map((blog, index) => {
            const isVideo = String(blog.blogType || '').toLowerCase() === 'video';
            const resolvedImage = blog.coverImg || (isVideo ? VIDEO_PLACEHOLDER_URL : null);
            const hasImage = Boolean(resolvedImage) && !failedImages[blog.id];
            const layoutClass = staggered ? `masonry-${index % 6}` : '';

            return (
              <article
                key={blog.id}
                className={`blog-card compact-card ${isVideo ? 'video-card' : 'article-card'} ${
                  !hasImage ? 'no-image' : ''
                } ${layoutClass}`}
              >
                {hasImage ? (
                  <div className="card-image-wrap">
                    <img
                      src={resolvedImage}
                      alt={blog.title}
                      onError={() =>
                        setFailedImages((prev) => ({
                          ...prev,
                          [blog.id]: true,
                        }))
                      }
                    />
                  </div>
                ) : null}

                <div className="blog-card-body">
                  <p className="meta">
                    {blog.category || 'General'} • {formatDate(blog.publishDate)}
                  </p>
                  <h3>{blog.title}</h3>
                  <p>{blog.summary || 'Read this post for details and insights.'}</p>
                  <div className="card-footer">
                    <Link to={`/blogs/${blog.blogURL || blog.id}`} className="card-cta">
                      {isVideo ? 'Watch now' : 'Read article'}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!filtered.length ? (
        <EmptyList
          title="No blogs available"
          description="No items match your filters right now. Try another category or tag."
        />
      ) : null}
    </section>
  );
};

export default BlogListSection;
