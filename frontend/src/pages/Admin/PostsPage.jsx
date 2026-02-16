import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteBlog, fetchAdminBlogs, updateBlog } from '../../api/admin';

const STATUS_OPTIONS = ['all', 'published', 'draft', 'pending_review', 'archived'];

const PostsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('published');
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = async () => {
    const response = await fetchAdminBlogs();
    setBlogs(response.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!window.confirm('Delete this blog?')) return;
    await deleteBlog(id);
    await load();
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllVisible = () => {
    const visibleIds = filteredBlogs.map((blog) => blog.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const runBulkStatusUpdate = async () => {
    if (!selectedIds.length) return;
    setBulkBusy(true);
    try {
      const selectedBlogs = blogs.filter((blog) => selectedIds.includes(blog.id));
      await Promise.all(
        selectedBlogs.map((blog) =>
          updateBlog(blog.id, {
            ...blog,
            status: bulkStatus,
          })
        )
      );
      setSelectedIds([]);
      await load();
    } finally {
      setBulkBusy(false);
    }
  };

  const runBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected blog(s)?`)) return;
    setBulkBusy(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteBlog(id)));
      setSelectedIds([]);
      await load();
    } finally {
      setBulkBusy(false);
    }
  };

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      if (statusFilter !== 'all' && blog.status !== statusFilter) {
        return false;
      }
      if (typeFilter !== 'all' && blog.blogType !== typeFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.trim().toLowerCase();
        const haystack = [blog.title, blog.summary, blog.category, ...(blog.blogTags || [])]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [blogs, searchTerm, statusFilter, typeFilter]);

  const metrics = useMemo(() => {
    const byStatus = { published: 0, draft: 0, pending_review: 0, archived: 0 };
    let videos = 0;
    blogs.forEach((blog) => {
      if (byStatus[blog.status] !== undefined) byStatus[blog.status] += 1;
      if (blog.blogType === 'video') videos += 1;
    });

    return {
      total: blogs.length,
      videos,
      written: blogs.length - videos,
      ...byStatus,
    };
  }, [blogs]);

  return (
    <section className="admin-section">
      <div className="page-title-row">
        <div>
          <h2>Blog Manager</h2>
          <p className="section-subtle">
            Manage lifecycle: publish, hold in review, draft updates, or archive.
          </p>
        </div>
        <Link className="button-link" to="/admin/posts/new">Create Post</Link>
      </div>

      <div className="stat-grid">
        <article><h3>{metrics.total}</h3><p>Total Posts</p></article>
        <article><h3>{metrics.published}</h3><p>Published</p></article>
        <article><h3>{metrics.draft}</h3><p>Draft</p></article>
        <article><h3>{metrics.pending_review}</h3><p>Pending Review</p></article>
        <article><h3>{metrics.archived}</h3><p>Archived</p></article>
        <article><h3>{metrics.videos}</h3><p>Video Posts</p></article>
      </div>

      <div className="admin-filters">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search title, category, tags"
        />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Statuses' : status.replace('_', ' ')}
            </option>
          ))}
        </select>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
          <option value="all">All Types</option>
          <option value="written">Written</option>
          <option value="video">Video</option>
        </select>
        <button
          type="button"
          className="mode-switch"
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setTypeFilter('all');
          }}
        >
          Reset Filters
        </button>
      </div>

      <div className="bulk-toolbar">
        <span>{selectedIds.length} selected</span>
        <select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)}>
          <option value="published">Set Posted</option>
          <option value="draft">Set Draft</option>
          <option value="pending_review">Set Waiting Approval</option>
          <option value="archived">Set Archived</option>
        </select>
        <button type="button" onClick={runBulkStatusUpdate} disabled={!selectedIds.length || bulkBusy}>
          {bulkBusy ? 'Updating...' : 'Bulk Update Status'}
        </button>
        <button
          type="button"
          className="danger-btn"
          onClick={runBulkDelete}
          disabled={!selectedIds.length || bulkBusy}
        >
          {bulkBusy ? 'Working...' : 'Bulk Delete'}
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={!!filteredBlogs.length && filteredBlogs.every((blog) => selectedIds.includes(blog.id))}
                  onChange={toggleAllVisible}
                />
              </th>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlogs.map((blog) => (
              <tr key={blog.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(blog.id)}
                    onChange={() => toggleSelected(blog.id)}
                  />
                </td>
                <td>
                  <strong>{blog.title}</strong>
                  <div className="table-secondary">{blog.summary || 'No summary'}</div>
                </td>
                <td>{blog.blogType}</td>
                <td>{blog.status}</td>
                <td>{blog.category || '-'}</td>
                <td>
                  <div className="table-actions">
                    <Link className="table-link-btn" to={`/admin/posts/${blog.id}/edit`}>Edit</Link>
                    <button className="danger-btn" type="button" onClick={() => onDelete(blog.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredBlogs.length && (
              <tr>
                <td colSpan={6} className="table-empty">
                  No posts match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PostsPage;
