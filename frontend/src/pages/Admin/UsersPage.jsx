import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import UserTable from '../../components/admin/UserTable';
import {
  createUser,
  deleteUser,
  getUsers,
  updateUserRole,
  updateUserStatus,
} from '../../api/users';
import usePageMeta from '../../hooks/usePageMeta';

const defaultForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'author',
};

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [formValues, setFormValues] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  usePageMeta({
    title: 'Team Access | Envision Wealth Planning',
    description: 'Manage admin users, roles, and workspace access.',
    canonicalUrl: '/admin/users',
    noIndex: true,
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (_error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await createUser(formValues);
      setFormValues(defaultForm);
      await loadUsers();
    } catch (submitError) {
      const message =
        submitError?.response?.data?.message ||
        'Unable to add teammate. Confirm the email is unique.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      setBusy(true);
      await updateUserRole(userId, role);
      await loadUsers();
    } catch (_error) {
      // Optionally surface toast
    } finally {
      setBusy(false);
    }
  };

  const handleStatusToggle = async (userId, isActive) => {
    try {
      setBusy(true);
      await updateUserStatus(userId, isActive);
      await loadUsers();
    } catch (_error) {
      // Optionally surface toast
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Remove this teammate? They will lose access immediately.')) {
      return;
    }

    try {
      setBusy(true);
      await deleteUser(userId);
      await loadUsers();
    } catch (_error) {
      // Optionally surface toast
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-grid" style={{ gap: '2rem' }}>
      <div className="card">
        <form className="form-grid" style={{ gap: '1rem' }} onSubmit={handleSubmit}>
          <div className="section-heading">
            <h2>Invite teammate</h2>
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

          <div
            className="form-grid"
            style={{
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            }}
          >
            <div className="form-field">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                name="firstName"
                required
                value={formValues.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                name="lastName"
                required
                value={formValues.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formValues.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Temporary password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formValues.password}
              onChange={handleChange}
              placeholder="Set an initial password"
            />
          </div>

          <div className="form-field">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formValues.role}
              onChange={handleChange}
            >
              <option value="admin">ADMIN</option>
              <option value="editor">EDITOR</option>
              <option value="author">AUTHOR</option>
              <option value="viewer">VIEWER</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Inviting…' : 'Invite to workspace'}
            </button>
          </div>
        </form>
      </div>

      <section>
        <div className="section-heading">
          <h2>Team roster</h2>
        </div>
        {loading ? (
          <div className="empty-state">
            <p>Loading teammates…</p>
          </div>
        ) : (
          <UserTable
            users={users}
            onRoleChange={handleRoleChange}
            onStatusToggle={handleStatusToggle}
            onDelete={handleDelete}
            currentUserId={currentUser?.id}
            isBusy={busy}
          />
        )}
      </section>
    </div>
  );
};

export default UsersPage;
