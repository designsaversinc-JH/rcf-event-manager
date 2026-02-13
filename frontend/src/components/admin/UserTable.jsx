import React from 'react';

const roles = ['admin', 'editor', 'author', 'viewer'];

const UserTable = ({
  users,
  onRoleChange,
  onStatusToggle,
  onDelete,
  currentUserId,
  isBusy,
}) => {
  if (!users?.length) {
    return (
      <div className="empty-state">
        <h3 style={{ marginBottom: '0.5rem' }}>No teammates yet</h3>
        <p>Invite collaborators to co-author stories and manage content workflows.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isCurrentUser = user.id === currentUserId;

            return (
              <tr key={user.id}>
                <td>
                  <strong>{`${user.firstName} ${user.lastName}`}</strong>
                </td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    disabled={isCurrentUser || isBusy}
                    onChange={(event) => onRoleChange(user.id, event.target.value)}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <span
                    className={`status-chip ${user.isActive ? 'published' : 'draft'}`}
                  >
                    {user.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td>
                  <div className="category-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={isCurrentUser || isBusy}
                      onClick={() => onStatusToggle(user.id, !user.isActive)}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      disabled={isCurrentUser || isBusy}
                      onClick={() => onDelete(user.id)}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
