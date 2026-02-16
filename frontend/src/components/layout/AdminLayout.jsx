import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchSettings } from '../../api/admin';

const DEFAULT_LOGO =
  'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/evision-wealth-bog-management-5fsiev/assets/67rajg4nyg8i/EW_Logo2022-01-1-1200x282.png';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [adminLogoUrl, setAdminLogoUrl] = useState(DEFAULT_LOGO);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetchSettings();
        setAdminLogoUrl(response.data?.admin_logo_url || DEFAULT_LOGO);
      } catch (_error) {
        setAdminLogoUrl(DEFAULT_LOGO);
      }
    };

    loadSettings();
  }, []);

  const onLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand-block">
          <p className="brand-kicker">Client Console</p>
          <img className="admin-sidebar-logo" src={adminLogoUrl} alt="Admin logo" />
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/posts">Blogs</NavLink>
          <NavLink to="/admin/profile">Profile</NavLink>
          <NavLink to="/admin/settings">Settings</NavLink>
          <NavLink to="/admin/help">Help</NavLink>
        </nav>
        <div className="admin-user-panel">
          <p>{user?.name}</p>
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
