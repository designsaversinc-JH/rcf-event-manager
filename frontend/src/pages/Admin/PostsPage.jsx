import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteBlog, fetchAdminBlogs, updateBlog } from '../../api/admin';
import usePageMeta from '../../hooks/usePageMeta';

const STATUS_OPTIONS = ['all', 'published', 'draft', 'pending_review', 'archived'];

const Icon = ({ name }) => {
  const paths = {
    eye: 'M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8z',
    edit: 'M4 16.5V20h3.5l10-10-3.5-3.5-10 10zM19.7 7.3a1 1 0 000-1.4L17.1 3.3a1 1 0 00-1.4 0l-1.5 1.5 3.5 3.5 2-2z',
    trash: 'M7 7h10l-1 13H8L7 7zm2-3h6l1 2H8l1-2z',
    wand: 'M3 21l9-9m-3-9l2-2 3 3-2 2m3 6l2-2 3 3-2 2',
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="btn-icon">
      <path d={paths[name]} />
    </svg>
  );
};

const PostsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('published');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState(null);
  const PAGE_SIZE = 8;

  usePageMeta({
    title: 'Manage Events | Roseland Ceasefire',
    description: 'Create, update, archive, and manage all event and video updates.',
    canonicalUrl: '/admin/posts',
    noIndex: true,
  });

  const load = async () => {
    const response = await fetchAdminBlogs();
    setBlogs(response.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    setConfirmModal({
      type: 'single-delete',
      title: 'Delete event?',
      message: 'This event entry will be permanently removed.',
      targetId: id,
    });
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllVisible = () => {
    const visibleIds = pagedBlogs.map((blog) => blog.id);
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
    setConfirmModal({
      type: 'bulk-delete',
      title: `Delete ${selectedIds.length} selected events?`,
      message: 'This action cannot be undone.',
    });
  };

  const confirmAction = async () => {
    if (!confirmModal) return;

    setBulkBusy(true);
    try {
      if (confirmModal.type === 'single-delete' && confirmModal.targetId) {
        await deleteBlog(confirmModal.targetId);
      }
      if (confirmModal.type === 'bulk-delete') {
        await Promise.all(selectedIds.map((id) => deleteBlog(id)));
        setSelectedIds([]);
      }
      await load();
    } finally {
      setBulkBusy(false);
      setConfirmModal(null);
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

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE));
  const pagedBlogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredBlogs.slice(start, start + PAGE_SIZE);
  }, [filteredBlogs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
          <h2>Event Manager</h2>
          <p className="section-subtle">
            Manage event lifecycle: publish, hold in review, draft updates, or archive.
          </p>
        </div>
        <Link className="button-link" to="/admin/posts/new">Create Event</Link>
      </div>

      <div className="stat-grid">
        <article><h3>{metrics.total}</h3><p>Total Events</p></article>
        <article><h3>{metrics.published}</h3><p>Published</p></article>
        <article><h3>{metrics.draft}</h3><p>Draft</p></article>
        <article><h3>{metrics.pending_review}</h3><p>Pending Review</p></article>
        <article><h3>{metrics.archived}</h3><p>Archived</p></article>
        <article><h3>{metrics.videos}</h3><p>Video Events</p></article>
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
        <button
          type="button"
          className="mode-switch"
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setTypeFilter('all');
            setCurrentPage(1);
          }}
        >
          Reset Filters
        </button>
      </div>

      <div className="list-tabs">
        <button
          type="button"
          className={typeFilter === 'all' ? 'active' : ''}
          onClick={() => setTypeFilter('all')}
        >
          All
        </button>
        <button
          type="button"
          className={typeFilter === 'written' ? 'active' : ''}
          onClick={() => setTypeFilter('written')}
        >
          Written
        </button>
        <button
          type="button"
          className={typeFilter === 'video' ? 'active' : ''}
          onClick={() => setTypeFilter('video')}
        >
          Video
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
          <Icon name="wand" />
          {bulkBusy ? 'Updating...' : 'Bulk Update Status'}
        </button>
        <button
          type="button"
          className="danger-btn"
          onClick={runBulkDelete}
          disabled={!selectedIds.length || bulkBusy}
        >
          <Icon name="trash" />
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
                  checked={!!pagedBlogs.length && pagedBlogs.every((blog) => selectedIds.includes(blog.id))}
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
            {pagedBlogs.map((blog) => (
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
                    <Link className="table-link-btn" to={`/admin/posts/${blog.id}/view`}>
                      <Icon name="eye" />
                      View
                    </Link>
                    <Link className="table-link-btn" to={`/admin/posts/${blog.id}/edit`}>
                      <Icon name="edit" />
                      Edit
                    </Link>
                    <button className="danger-btn" type="button" onClick={() => onDelete(blog.id)}>
                      <Icon name="trash" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!pagedBlogs.length && (
              <tr>
                <td colSpan={6} className="table-empty">
                  No events match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="list-pagination">
        <button
          type="button"
          className="mode-switch"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          className="mode-switch"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {confirmModal ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>{confirmModal.title}</h3>
            <p>{confirmModal.message}</p>
            <div className="modal-actions">
              <button type="button" className="mode-switch" onClick={() => setConfirmModal(null)}>
                Cancel
              </button>
              <button type="button" className="danger-btn" onClick={confirmAction} disabled={bulkBusy}>
                {bulkBusy ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default PostsPage;
