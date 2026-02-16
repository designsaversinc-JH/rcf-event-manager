import React, { useEffect, useState } from 'react';
import {
  createAdminUser,
  createCategory,
  createTag,
  deleteAdminUser,
  deleteCategory,
  deleteTag,
  fetchAdminUsers,
  fetchCategories,
  fetchNavigation,
  fetchSettings,
  fetchTags,
  saveNavigation,
  saveSettings,
  updateAdminUserRole,
  updateAdminUserStatus,
  updateCategory,
} from '../../api/admin';
import { getAllPageContent, getPageContent } from '../../utils/pageContent';

const INTERNAL_ROUTE_CHOICES = [
  { label: 'Blogs Home', href: '/' },
  { label: 'All Blogs', href: '/all-blogs' },
  { label: 'Video Blogs', href: '/video-blogs' },
  { label: 'Admin Dashboard', href: '/admin/dashboard' },
  { label: 'Manage Blogs', href: '/admin/posts' },
  { label: 'Create Blog', href: '/admin/posts/new' },
  { label: 'Settings', href: '/admin/settings' },
];

const TABS = [
  { id: 'general', label: 'App Settings' },
  { id: 'pages', label: 'Page Content & SEO' },
  { id: 'branding', label: 'Branding' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'taxonomy', label: 'Categories & Tags' },
  { id: 'team', label: 'Team & Access' },
];

const PAGE_CONFIGS = [
  {
    key: 'landing',
    label: 'Landing Page',
    route: '/',
    description: 'Main homepage hero and featured posts section.',
    showSectionFields: true,
  },
  {
    key: 'all_blogs',
    label: 'All Blogs Page',
    route: '/all-blogs',
    description: 'Header and metadata for the all blogs listing page.',
    showSectionFields: false,
  },
  {
    key: 'video_blogs',
    label: 'Video Blogs Page',
    route: '/video-blogs',
    description: 'Header and metadata for the video blogs page.',
    showSectionFields: false,
  },
];

const defaultInvite = {
  name: '',
  email: '',
  role: 'editor',
  password: '',
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [navigation, setNavigation] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [inviteForm, setInviteForm] = useState(defaultInvite);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [settingsRes, navRes, catRes, tagRes, usersRes] = await Promise.all([
      fetchSettings(),
      fetchNavigation(),
      fetchCategories(),
      fetchTags(),
      fetchAdminUsers(),
    ]);
    const nextSettings = settingsRes.data || null;
    if (nextSettings) {
      nextSettings.page_content = getAllPageContent(nextSettings);
    }
    setSettings(nextSettings);
    setNavigation(navRes.data || []);
    setCategories(catRes.data || []);
    setTags(tagRes.data || []);
    setUsers(usersRes.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  if (!settings) {
    return <div className="page-loading">Loading settings...</div>;
  }

  const onSettingsSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveSettings({
        siteTitle: settings.site_title,
        heroTitle: settings.hero_title,
        heroSubtitle: settings.hero_subtitle,
        primaryCtaLabel: settings.primary_cta_label,
        primaryCtaHref: settings.primary_cta_href,
        secondaryCtaLabel: settings.secondary_cta_label,
        secondaryCtaHref: settings.secondary_cta_href,
        accentMessage: settings.accent_message,
        adminLogoUrl: settings.admin_logo_url,
        publicLogoUrl: settings.public_logo_url,
        pageContent: getAllPageContent(settings),
      });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const onSaveNav = async () => {
    setSaving(true);
    try {
      await saveNavigation(navigation);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const renderGeneralTab = () => (
    <form className="settings-pane-card" onSubmit={onSettingsSave}>
      <h3>General</h3>
      <p className="settings-help">Configure default hero copy and calls to action.</p>

      <div className="settings-row">
        <div>
          <strong>Site Title</strong>
          <p>Shown across public pages and browser metadata.</p>
        </div>
        <input
          value={settings.site_title || ''}
          onChange={(e) => setSettings((prev) => ({ ...prev, site_title: e.target.value }))}
        />
      </div>

      <div className="settings-row">
        <div>
          <strong>Hero Title</strong>
          <p>Main heading for the blog landing page.</p>
        </div>
        <input
          value={settings.hero_title || ''}
          onChange={(e) => setSettings((prev) => ({ ...prev, hero_title: e.target.value }))}
        />
      </div>

      <div className="settings-row">
        <div>
          <strong>Hero Subtitle</strong>
          <p>Supporting text under the hero title.</p>
        </div>
        <textarea
          rows={3}
          value={settings.hero_subtitle || ''}
          onChange={(e) => setSettings((prev) => ({ ...prev, hero_subtitle: e.target.value }))}
        />
      </div>

      <div className="settings-row">
        <div>
          <strong>Primary CTA</strong>
          <p>Label and URL for the primary button.</p>
        </div>
        <div className="settings-inline-inputs">
          <input
            placeholder="Button label"
            value={settings.primary_cta_label || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, primary_cta_label: e.target.value }))
            }
          />
          <input
            placeholder="URL"
            value={settings.primary_cta_href || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, primary_cta_href: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="settings-row">
        <div>
          <strong>Secondary CTA</strong>
          <p>Label and URL for the secondary button.</p>
        </div>
        <div className="settings-inline-inputs">
          <input
            placeholder="Button label"
            value={settings.secondary_cta_label || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, secondary_cta_label: e.target.value }))
            }
          />
          <input
            placeholder="URL"
            value={settings.secondary_cta_href || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, secondary_cta_href: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="settings-row">
        <div>
          <strong>Accent Message</strong>
          <p>Short announcement banner text.</p>
        </div>
        <input
          value={settings.accent_message || ''}
          onChange={(e) =>
            setSettings((prev) => ({ ...prev, accent_message: e.target.value }))
          }
        />
      </div>

      <div className="settings-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save App Settings'}
        </button>
      </div>
    </form>
  );

  const renderBrandingTab = () => (
    <form className="settings-pane-card" onSubmit={onSettingsSave}>
      <h3>Branding</h3>
      <p className="settings-help">Keep logos synchronized across admin and public pages.</p>

      <div className="settings-row">
        <div>
          <strong>Sidebar Logo URL</strong>
          <p>Displayed inside the admin sidebar toolbar.</p>
        </div>
        <input
          placeholder="https://..."
          value={settings.admin_logo_url || ''}
          onChange={(e) => setSettings((prev) => ({ ...prev, admin_logo_url: e.target.value }))}
        />
      </div>

      <div className="settings-row">
        <div>
          <strong>Public Logo URL</strong>
          <p>Used in the public header and footer.</p>
        </div>
        <input
          placeholder="https://..."
          value={settings.public_logo_url || ''}
          onChange={(e) => setSettings((prev) => ({ ...prev, public_logo_url: e.target.value }))}
        />
      </div>

      <div className="settings-logo-preview-grid">
        <div className="settings-logo-preview">
          <span>Admin Preview</span>
          <img src={settings.admin_logo_url || settings.public_logo_url || ''} alt="Admin logo preview" />
        </div>
        <div className="settings-logo-preview">
          <span>Public Preview</span>
          <img src={settings.public_logo_url || settings.admin_logo_url || ''} alt="Public logo preview" />
        </div>
      </div>

      <div className="settings-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Branding'}
        </button>
      </div>
    </form>
  );

  const setPageField = (pageKey, fieldKey, value) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const currentPageContent = getAllPageContent(prev);
      return {
        ...prev,
        page_content: {
          ...currentPageContent,
          [pageKey]: {
            ...currentPageContent[pageKey],
            [fieldKey]: value,
          },
        },
      };
    });
  };

  const renderPageContentTab = () => (
    <form className="settings-pane-card" onSubmit={onSettingsSave}>
      <h3>Page Content & SEO</h3>
      <p className="settings-help">Manage per-page title, subtext, metadata, and canonical URL.</p>

      <div className="stack-list">
        {PAGE_CONFIGS.map((pageConfig) => {
          const pageData = getPageContent(settings, pageConfig.key);
          return (
            <div className="settings-subcard" key={pageConfig.key}>
              <h4>{pageConfig.label}</h4>
              <p className="settings-help">{pageConfig.description} Route: {pageConfig.route}</p>

              <div className="settings-row settings-row-stacked">
                <div>
                  <strong>Title</strong>
                  <p>Main heading shown on the page.</p>
                </div>
                <input
                  value={pageData.title || ''}
                  onChange={(e) => setPageField(pageConfig.key, 'title', e.target.value)}
                />
              </div>

              <div className="settings-row settings-row-stacked">
                <div>
                  <strong>Subtext</strong>
                  <p>Supporting copy under the main title.</p>
                </div>
                <textarea
                  rows={3}
                  value={pageData.subtext || ''}
                  onChange={(e) => setPageField(pageConfig.key, 'subtext', e.target.value)}
                />
              </div>

              {pageConfig.showSectionFields ? (
                <>
                  <div className="settings-row settings-row-stacked">
                    <div>
                      <strong>Section Title</strong>
                      <p>Title for the featured content block.</p>
                    </div>
                    <input
                      value={pageData.section_title || ''}
                      onChange={(e) => setPageField(pageConfig.key, 'section_title', e.target.value)}
                    />
                  </div>

                  <div className="settings-row settings-row-stacked">
                    <div>
                      <strong>Section Subtext</strong>
                      <p>Supporting copy for the featured content block.</p>
                    </div>
                    <textarea
                      rows={2}
                      value={pageData.section_subtext || ''}
                      onChange={(e) => setPageField(pageConfig.key, 'section_subtext', e.target.value)}
                    />
                  </div>
                </>
              ) : null}

              <div className="settings-row settings-row-stacked">
                <div>
                  <strong>Meta Title</strong>
                  <p>Browser title and search result headline.</p>
                </div>
                <input
                  value={pageData.meta_title || ''}
                  onChange={(e) => setPageField(pageConfig.key, 'meta_title', e.target.value)}
                />
              </div>

              <div className="settings-row settings-row-stacked">
                <div>
                  <strong>Meta Description</strong>
                  <p>Search snippet description.</p>
                </div>
                <textarea
                  rows={3}
                  value={pageData.meta_description || ''}
                  onChange={(e) => setPageField(pageConfig.key, 'meta_description', e.target.value)}
                />
              </div>

              <div className="settings-row settings-row-stacked">
                <div>
                  <strong>Canonical URL</strong>
                  <p>Use an absolute URL or a route path (example: /all-blogs).</p>
                </div>
                <input
                  value={pageData.canonical_url || ''}
                  onChange={(e) => setPageField(pageConfig.key, 'canonical_url', e.target.value)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="settings-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Page Content & SEO'}
        </button>
      </div>
    </form>
  );

  const renderNavigationTab = () => (
    <section className="settings-pane-card">
      <h3>Navigation</h3>
      <p className="settings-help">Manage link label, URL, visibility, and quick route presets.</p>

      <div className="stack-list">
        {navigation.map((item, index) => (
          <div className="settings-nav-card" key={item.id || index}>
            <div className="settings-row settings-row-stacked">
              <div>
                <strong>Label</strong>
                <p>Menu display name.</p>
              </div>
              <input
                value={item.label}
                onChange={(e) => {
                  const next = [...navigation];
                  next[index] = { ...item, label: e.target.value };
                  setNavigation(next);
                }}
              />
            </div>

            <div className="settings-row settings-row-stacked">
              <div>
                <strong>URL</strong>
                <p>Use custom URL or quick route chips.</p>
              </div>
              <input
                value={item.href}
                placeholder="/all-blogs or https://example.com/page"
                onChange={(e) => {
                  const next = [...navigation];
                  next[index] = { ...item, href: e.target.value };
                  setNavigation(next);
                }}
              />
              <div className="route-chip-row">
                {INTERNAL_ROUTE_CHOICES.map((choice) => {
                  const isSelected = item.href === choice.href;
                  return (
                    <button
                      key={`${item.id || index}-${choice.href}`}
                      type="button"
                      className={`route-chip ${isSelected ? 'route-chip-active' : ''}`}
                      onClick={() => {
                        const next = [...navigation];
                        next[index] = { ...item, href: choice.href };
                        setNavigation(next);
                      }}
                    >
                      {choice.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="settings-row settings-row-inline-end">
              <div>
                <strong>Visible</strong>
                <p>Toggle if this item appears in public nav.</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={item.visible !== false}
                  onChange={(e) => {
                    const next = [...navigation];
                    next[index] = { ...item, visible: e.target.checked };
                    setNavigation(next);
                  }}
                />
                <span className="switch-slider" />
              </label>
              <button
                className="danger-btn"
                type="button"
                onClick={() => {
                  const next = [...navigation];
                  next.splice(index, 1);
                  setNavigation(next);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="settings-actions">
        <button
          type="button"
          onClick={() =>
            setNavigation((prev) => [
              ...prev,
              { id: '', label: 'New Item', href: '/', visible: true },
            ])
          }
        >
          Add Nav Item
        </button>
        <button type="button" onClick={onSaveNav} disabled={saving}>
          {saving ? 'Saving...' : 'Save Navigation'}
        </button>
      </div>
    </section>
  );

  const renderTaxonomyTab = () => (
    <section className="settings-pane-card">
      <h3>Categories & Tags</h3>
      <p className="settings-help">Maintain content taxonomy used in filters and organization.</p>

      <div className="settings-split">
        <div className="settings-subcard">
          <h4>Categories</h4>
          <div className="stack-list">
            {categories.map((item) => (
              <div key={item.id} className="simple-row">
                <input
                  value={item.name}
                  onChange={(e) =>
                    setCategories((prev) =>
                      prev.map((row) =>
                        row.id === item.id ? { ...row, name: e.target.value } : row
                      )
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    updateCategory(item.id, {
                      name: item.name,
                      description: item.description || '',
                    })
                  }
                >
                  Save
                </button>
                <button
                  className="danger-btn"
                  type="button"
                  onClick={async () => {
                    await deleteCategory(item.id);
                    await load();
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <div className="simple-row">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category"
            />
            <button
              type="button"
              onClick={async () => {
                if (!newCategory.trim()) return;
                await createCategory({ name: newCategory.trim() });
                setNewCategory('');
                await load();
              }}
            >
              Add
            </button>
          </div>
        </div>

        <div className="settings-subcard">
          <h4>Tags</h4>
          <div className="stack-list">
            {tags.map((item) => (
              <div key={item.id} className="simple-row">
                <span>{item.name}</span>
                <button
                  className="danger-btn"
                  type="button"
                  onClick={async () => {
                    await deleteTag(item.id);
                    await load();
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <div className="simple-row">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="New tag"
            />
            <button
              type="button"
              onClick={async () => {
                if (!newTag.trim()) return;
                await createTag({ name: newTag.trim() });
                setNewTag('');
                await load();
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderTeamTab = () => (
    <section className="settings-pane-card">
      <h3>Team & Access</h3>
      <p className="settings-help">Manage users, roles, and permissions for the admin workspace.</p>

      <div className="settings-subcard">
        <h4>Invite Admin User</h4>
        <div className="settings-inline-inputs">
          <input
            placeholder="Full name"
            value={inviteForm.name}
            onChange={(e) => setInviteForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            placeholder="Email"
            value={inviteForm.email}
            onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <select
            value={inviteForm.role}
            onChange={(e) => setInviteForm((prev) => ({ ...prev, role: e.target.value }))}
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="author">Author</option>
            <option value="viewer">Viewer</option>
          </select>
          <input
            placeholder="Temporary password"
            value={inviteForm.password}
            onChange={(e) =>
              setInviteForm((prev) => ({ ...prev, password: e.target.value }))
            }
          />
          <button
            type="button"
            onClick={async () => {
              if (!inviteForm.name || !inviteForm.email) return;
              await createAdminUser(inviteForm);
              setInviteForm(defaultInvite);
              await load();
            }}
          >
            Invite
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={async (e) => {
                      await updateAdminUserRole(user.id, e.target.value);
                      await load();
                    }}
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="author">Author</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={Boolean(user.is_active)}
                      onChange={async (e) => {
                        await updateAdminUserStatus(user.id, e.target.checked);
                        await load();
                      }}
                    />
                    <span className="switch-slider" />
                  </label>
                </td>
                <td>
                  <button
                    className="danger-btn"
                    type="button"
                    onClick={async () => {
                      if (!window.confirm('Delete this user?')) return;
                      await deleteAdminUser(user.id);
                      await load();
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderActiveTab = () => {
    if (activeTab === 'general') return renderGeneralTab();
    if (activeTab === 'pages') return renderPageContentTab();
    if (activeTab === 'branding') return renderBrandingTab();
    if (activeTab === 'navigation') return renderNavigationTab();
    if (activeTab === 'taxonomy') return renderTaxonomyTab();
    return renderTeamTab();
  };

  return (
    <section className="settings-shell">
      <aside className="settings-sidebar">
        <h2>Settings</h2>
        <p>Configure your app experience and access.</p>
        <div className="settings-tab-list">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </aside>
      <div className="settings-content">{renderActiveTab()}</div>
    </section>
  );
};

export default SettingsPage;
