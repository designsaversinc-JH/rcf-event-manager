import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { fetchProfile, saveProfile } from '../../api/admin';
import usePageMeta from '../../hooks/usePageMeta';

const ProfilePage = () => {
  const { setUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  usePageMeta({
    title: 'Profile Settings | Envision Wealth Planning',
    description: 'Update your profile details and account password.',
    canonicalUrl: '/admin/profile',
    noIndex: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchProfile();
        const profile = response.data || {};
        setForm((prev) => ({
          ...prev,
          name: profile.name || '',
          email: profile.email || '',
          role: profile.role || '',
        }));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setNotice('');

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setNotice('New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined,
      };

      const response = await saveProfile(payload);
      const updatedProfile = response.data || {};

      setUserProfile(updatedProfile);
      setForm((prev) => ({
        ...prev,
        name: updatedProfile.name || prev.name,
        email: updatedProfile.email || prev.email,
        role: updatedProfile.role || prev.role,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setNotice('Profile updated.');
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading profile...</div>;
  }

  return (
    <section className="admin-section">
      <h2>Profile Settings</h2>
      <p className="section-subtle">Update your profile information and password.</p>

      <form className="profile-card" onSubmit={onSubmit}>
        <div className="profile-grid">
          <div>
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label htmlFor="profile-email">Email</label>
            <input id="profile-email" value={form.email} disabled />
          </div>
          <div>
            <label htmlFor="profile-role">Role</label>
            <input id="profile-role" value={form.role} disabled />
          </div>
          <div>
            <label htmlFor="profile-current-password">Current Password</label>
            <input
              id="profile-current-password"
              type="password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="Required only when changing password"
            />
          </div>
          <div>
            <label htmlFor="profile-new-password">New Password</label>
            <input
              id="profile-new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={form.newPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="profile-confirm-password">Confirm New Password</label>
            <input
              id="profile-confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={form.confirmPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </div>
        </div>

        {notice ? <p className="form-error">{notice}</p> : null}

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ProfilePage;
