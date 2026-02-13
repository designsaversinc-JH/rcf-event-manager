import React, { useEffect, useMemo, useState } from 'react';

const defaultValues = {
  title: '',
  excerpt: '',
  content: '',
  status: 'draft',
  categories: [],
  coverImageUrl: '',
  publishedAt: '',
  isFeatured: false,
};

const toInputDateTime = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(
    2,
    '0'
  )}-${`${date.getDate()}`.padStart(2, '0')}T${`${date.getHours()}`.padStart(
    2,
    '0'
  )}:${`${date.getMinutes()}`.padStart(2, '0')}`;
};

const PostForm = ({ categories, initialValues = {}, isSaving, onSubmit, mode }) => {
  const [values, setValues] = useState(() => ({
    ...defaultValues,
    ...initialValues,
    categories: initialValues.categories?.map((category) => category.id) || [],
    publishedAt: toInputDateTime(initialValues.publishedAt),
  }));
  const [coverImageFile, setCoverImageFile] = useState(null);

  useEffect(() => {
    setValues({
      ...defaultValues,
      ...initialValues,
      categories: initialValues.categories?.map((category) => category.id) || [],
      publishedAt: toInputDateTime(initialValues.publishedAt),
    });
    setCoverImageFile(null);
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setValues((prev) => {
      const isSelected = prev.categories.includes(categoryId);
      return {
        ...prev,
        categories: isSelected
          ? prev.categories.filter((id) => id !== categoryId)
          : [...prev.categories, categoryId],
      };
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setCoverImageFile(file || null);
  };

  const preparedPayload = useMemo(
    () => ({
      ...values,
      categories: values.categories,
      coverImageFile,
      publishedAt: values.publishedAt || null,
    }),
    [values, coverImageFile]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(preparedPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="card form-grid" style={{ gap: '1.5rem' }}>
      <div className="form-grid" style={{ gap: '1rem' }}>
        <div className="form-field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            required
            placeholder="Post title"
            value={values.title}
            onChange={handleChange}
          />
        </div>
        <div className="form-field">
          <label htmlFor="excerpt">Excerpt</label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            placeholder="Short summary that appears on the landing page"
            value={values.excerpt}
            onChange={handleChange}
          />
        </div>
        <div className="form-field">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            rows={10}
            required
            placeholder="Write your story..."
            value={values.content}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-grid" style={{ gap: '1rem' }}>
        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={values.status}
            onChange={handleChange}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="publishedAt">Publish date</label>
          <input
            id="publishedAt"
            name="publishedAt"
            type="datetime-local"
            value={values.publishedAt}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="isFeatured">
            <input
              id="isFeatured"
              type="checkbox"
              name="isFeatured"
              checked={values.isFeatured}
              onChange={handleChange}
              style={{ marginRight: '0.65rem' }}
            />
            Highlight this as a featured story
          </label>
        </div>

        <div className="form-field">
          <label>Categories</label>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
            }}
          >
            {categories.map((category) => {
              const isSelected = values.categories.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 0.9rem' }}
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  {category.name}
                </button>
              );
            })}
            {!categories.length && (
              <span style={{ color: '#94a3b8' }}>
                Add categories first to classify this post.
              </span>
            )}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="coverImage">Cover image</label>
          <input id="coverImage" type="file" accept="image/*" onChange={handleFileChange} />
          <small style={{ color: '#64748b' }}>
            Upload a new hero image or provide a URL below.
          </small>
        </div>

        <div className="form-field">
          <label htmlFor="coverImageUrl">Cover image URL</label>
          <input
            id="coverImageUrl"
            name="coverImageUrl"
            placeholder="https://"
            value={values.coverImageUrl}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? 'Saving…' : mode === 'edit' ? 'Update post' : 'Publish post'}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
