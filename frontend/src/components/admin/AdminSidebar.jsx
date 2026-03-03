import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview' },
  { to: '/admin/posts', label: 'Posts' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/users', label: 'Team' },
];

const AdminSidebar = () => (
  <aside className="admin-sidebar">
    <div>
      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Roseland Ceasefire Admin</span>
      <h2 style={{ margin: '0.25rem 0 0', fontSize: '1.35rem', color: '#0f172a' }}>
        Control Panel
      </h2>
    </div>
    <nav className="admin-sidebar__nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `admin-sidebar__link${isActive ? ' admin-sidebar__link-active' : ''}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default AdminSidebar;
