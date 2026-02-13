import React, { useEffect, useState } from 'react';
import {
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  fetchCategories,
  fetchNavigation,
  fetchSettings,
  fetchTags,
  saveNavigation,
  saveSettings,
  updateCategory,
} from '../../api/admin';

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [navigation, setNavigation] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');

  const load = async () => {
    const [settingsRes, navRes, catRes, tagRes] = await Promise.all([
      fetchSettings(),
      fetchNavigation(),
      fetchCategories(),
      fetchTags(),
    ]);
    setSettings(settingsRes.data || null);
    setNavigation(navRes.data || []);
    setCategories(catRes.data || []);
    setTags(tagRes.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  if (!settings) {
    return <div className="page-loading">Loading settings...</div>;
  }

  const onSettingsSave = async (event) => {
    event.preventDefault();
    await saveSettings({
      siteTitle: settings.site_title,
      heroTitle: settings.hero_title,
      heroSubtitle: settings.hero_subtitle,
      primaryCtaLabel: settings.primary_cta_label,
      primaryCtaHref: settings.primary_cta_href,
      secondaryCtaLabel: settings.secondary_cta_label,
      secondaryCtaHref: settings.secondary_cta_href,
      accentMessage: settings.accent_message,
    });
    await load();
  };

  const onSaveNav = async () => {
    await saveNavigation(navigation);
    await load();
  };

  return (
    <section className="settings-grid">
      <article>
        <h2>Site Settings</h2>
        <form className="editor-form" onSubmit={onSettingsSave}>
          <label>Site Title</label>
          <input value={settings.site_title} onChange={(e) => setSettings((prev) => ({ ...prev, site_title: e.target.value }))} />
          <label>Hero Title</label>
          <input value={settings.hero_title} onChange={(e) => setSettings((prev) => ({ ...prev, hero_title: e.target.value }))} />
          <label>Hero Subtitle</label>
          <textarea value={settings.hero_subtitle} onChange={(e) => setSettings((prev) => ({ ...prev, hero_subtitle: e.target.value }))} rows={3} />
          <label>Primary Button</label>
          <input value={settings.primary_cta_label} onChange={(e) => setSettings((prev) => ({ ...prev, primary_cta_label: e.target.value }))} />
          <label>Primary Button Link</label>
          <input value={settings.primary_cta_href} onChange={(e) => setSettings((prev) => ({ ...prev, primary_cta_href: e.target.value }))} />
          <label>Secondary Button</label>
          <input value={settings.secondary_cta_label} onChange={(e) => setSettings((prev) => ({ ...prev, secondary_cta_label: e.target.value }))} />
          <label>Secondary Button Link</label>
          <input value={settings.secondary_cta_href} onChange={(e) => setSettings((prev) => ({ ...prev, secondary_cta_href: e.target.value }))} />
          <label>Accent Message</label>
          <input value={settings.accent_message} onChange={(e) => setSettings((prev) => ({ ...prev, accent_message: e.target.value }))} />
          <button type="submit">Save Site Settings</button>
        </form>
      </article>

      <article>
        <h2>Navigation</h2>
        <div className="stack-list">
          {navigation.map((item, index) => (
            <div className="nav-editor-row" key={item.id || index}>
              <input
                value={item.label}
                onChange={(e) => {
                  const next = [...navigation];
                  next[index] = { ...item, label: e.target.value };
                  setNavigation(next);
                }}
              />
              <input
                value={item.href}
                onChange={(e) => {
                  const next = [...navigation];
                  next[index] = { ...item, href: e.target.value };
                  setNavigation(next);
                }}
              />
              <label>
                <input
                  type="checkbox"
                  checked={item.visible !== false}
                  onChange={(e) => {
                    const next = [...navigation];
                    next[index] = { ...item, visible: e.target.checked };
                    setNavigation(next);
                  }}
                />
                Visible
              </label>
              <button
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
          ))}
        </div>
        <div className="form-actions">
          <button
            type="button"
            onClick={() =>
              setNavigation((prev) => [...prev, { id: '', label: 'New Item', href: '/', visible: true }])
            }
          >
            Add Nav Item
          </button>
          <button type="button" onClick={onSaveNav}>Save Navigation</button>
        </div>
      </article>

      <article>
        <h2>Categories</h2>
        <div className="stack-list">
          {categories.map((item) => (
            <div key={item.id} className="simple-row">
              <input
                value={item.name}
                onChange={(e) =>
                  setCategories((prev) => prev.map((row) => (row.id === item.id ? { ...row, name: e.target.value } : row)))
                }
              />
              <button type="button" onClick={() => updateCategory(item.id, { name: item.name, description: item.description || '' })}>
                Save
              </button>
              <button type="button" onClick={async () => { await deleteCategory(item.id); await load(); }}>
                Delete
              </button>
            </div>
          ))}
        </div>
        <div className="simple-row">
          <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category" />
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
      </article>

      <article>
        <h2>Tags</h2>
        <div className="stack-list">
          {tags.map((item) => (
            <div key={item.id} className="simple-row">
              <span>{item.name}</span>
              <button type="button" onClick={async () => { await deleteTag(item.id); await load(); }}>
                Delete
              </button>
            </div>
          ))}
        </div>
        <div className="simple-row">
          <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="New tag" />
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
      </article>
    </section>
  );
};

export default SettingsPage;
