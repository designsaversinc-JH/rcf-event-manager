import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteBlog, fetchAdminBlogs } from '../../api/admin';

const PostsPage = () => {
  const [blogs, setBlogs] = useState([]);

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

  return (
    <section className="admin-section">
      <div className="page-title-row">
        <h2>Blogs</h2>
        <Link className="button-link" to="/admin/posts/new">Add Blog</Link>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.id}>
                <td>{blog.title}</td>
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
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PostsPage;
