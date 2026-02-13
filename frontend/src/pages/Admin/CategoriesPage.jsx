import React, { useEffect, useState } from 'react';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../../api/categories';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (_error) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormValues({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormValues(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingId) {
        await updateCategory(editingId, formValues);
      } else {
        await createCategory(formValues);
      }

      resetForm();
      await loadCategories();
    } catch (submitError) {
      const message =
        submitError?.response?.data?.message ||
        'Unable to save category. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Posts will remain without it.')) {
      return;
    }

    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (_error) {
      // Normally surface toast
    }
  };

  return (
    <div className="form-grid" style={{ gap: '2rem' }}>
      <div className="card">
        <form className="form-grid" style={{ gap: '1rem' }} onSubmit={handleSubmit}>
          <div className="section-heading">
            <h2>{editingId ? 'Edit category' : 'Create a category'}</h2>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(248, 113, 113, 0.15)',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
              }}
            >
              {error}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              required
              placeholder="Customer stories"
              value={formValues.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label htmlFor="slug">Slug</label>
            <input
              id="slug"
              name="slug"
              placeholder="customer-stories"
              value={formValues.slug}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Short descriptor for internal reference"
              value={formValues.description}
              onChange={handleChange}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : editingId ? 'Update category' : 'Create category'}
            </button>
          </div>
        </form>
      </div>

      <section>
        <div className="section-heading">
          <h2>All categories</h2>
        </div>
        {loading ? (
          <div className="empty-state">
            <p>Loading categories…</p>
          </div>
        ) : (
          <div className="category-list">
            {categories.map((category) => (
              <div key={category.id} className="category-item">
                <div>
                  <strong style={{ display: 'block', color: '#0f172a' }}>
                    {category.name}
                  </strong>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    {category.slug}
                  </span>
                </div>
                <div className="category-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => handleDelete(category.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!categories.length && (
              <div className="empty-state">
                <p>Start by creating a category to organize your posts.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoriesPage;
