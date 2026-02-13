const express = require('express');
const { randomUUID } = require('crypto');
const slugify = require('slugify');
const { query } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireAdmin);

const makeId = (prefix) => `${prefix}-${randomUUID().slice(0, 8)}`;

const toBlogResponse = (row) => ({
  id: row.id,
  title: row.title,
  content: row.content,
  publishDate: row.publish_date,
  author: row.author,
  status: row.status,
  category: row.category,
  coverImg: row.cover_img,
  blogURL: row.blog_url,
  summary: row.summary,
  updatedAt: row.updated_at,
  createdAt: row.created_at,
  blogType: row.blog_type,
  vlogContent: row.vlog_content,
  vlogEmbed: row.vlog_embed,
  vlogURL: row.vlog_url,
  blogTags: row.blog_tags || [],
});

const syncBlogTags = async (blogId, tagNamesInput = []) => {
  const tagNames = [...new Set((Array.isArray(tagNamesInput) ? tagNamesInput : []).map((name) => String(name).trim()).filter(Boolean))];

  await query('DELETE FROM blog_tags WHERE blog_id = $1', [blogId]);

  for (const tagName of tagNames) {
    const tagResult = await query('SELECT id FROM tags WHERE lower(name) = lower($1) LIMIT 1', [tagName]);

    let tagId = tagResult.rows[0]?.id;
    if (!tagId) {
      tagId = makeId('tag');
      await query('INSERT INTO tags (id, name, updated_at) VALUES ($1, $2, NOW())', [tagId, tagName]);
    }

    await query('INSERT INTO blog_tags (blog_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
      blogId,
      tagId,
    ]);
  }
};

router.get('/dashboard', async (_req, res, next) => {
  try {
    const [blogs, jobs, categories, tags] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM blogs', []),
      query('SELECT COUNT(*)::int AS count FROM jobs WHERE status = $1', ['open']),
      query('SELECT COUNT(*)::int AS count FROM categories', []),
      query('SELECT COUNT(*)::int AS count FROM tags', []),
    ]);

    res.status(200).json({
      totalBlogs: blogs.rows[0].count,
      openJobs: jobs.rows[0].count,
      totalCategories: categories.rows[0].count,
      totalTags: tags.rows[0].count,
      quickActions: [
        { label: 'Create Blog', href: '/admin/posts/new' },
        { label: 'Manage Blogs', href: '/admin/posts' },
        { label: 'Edit Navigation', href: '/admin/settings' },
      ],
    });
  } catch (error) {
    next(error);
  }
});

router.get('/blogs', async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT b.*, COALESCE(array_remove(array_agg(t.name), NULL), '{}') AS blog_tags
       FROM blogs b
       LEFT JOIN blog_tags bt ON bt.blog_id = b.id
       LEFT JOIN tags t ON t.id = bt.tag_id
       GROUP BY b.id
       ORDER BY b.updated_at DESC`,
      []
    );

    res.status(200).json(rows.map(toBlogResponse));
  } catch (error) {
    next(error);
  }
});

router.get('/blogs/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT b.*, COALESCE(array_remove(array_agg(t.name), NULL), '{}') AS blog_tags
       FROM blogs b
       LEFT JOIN blog_tags bt ON bt.blog_id = b.id
       LEFT JOIN tags t ON t.id = bt.tag_id
       WHERE b.id = $1
       GROUP BY b.id
       LIMIT 1`,
      [req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    return res.status(200).json(toBlogResponse(rows[0]));
  } catch (error) {
    return next(error);
  }
});

router.post('/blogs', async (req, res, next) => {
  try {
    const {
      title,
      content,
      publishDate,
      author,
      status,
      category,
      coverImg,
      blogURL,
      summary,
      blogType,
      vlogContent,
      vlogEmbed,
      vlogURL,
      blogTags,
    } = req.body || {};

    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const id = makeId('blog');
    const normalizedStatus = status === 'published' ? 'published' : 'draft';
    const normalizedType = blogType === 'video' ? 'video' : 'written';
    const slug = (blogURL || slugify(title, { lower: true, strict: true })).slice(0, 120);

    await query(
      `INSERT INTO blogs (
        id, title, content, publish_date, author, status, category, cover_img, blog_url,
        summary, updated_at, blog_type, vlog_content, vlog_embed, vlog_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11, $12, $13, $14)`,
      [
        id,
        title,
        content || null,
        publishDate || null,
        author || req.user.name,
        normalizedStatus,
        category || null,
        coverImg || null,
        slug,
        summary || null,
        normalizedType,
        vlogContent || null,
        vlogEmbed || null,
        vlogURL || null,
      ]
    );

    await syncBlogTags(id, blogTags);

    const { rows } = await query(
      `SELECT b.*, COALESCE(array_remove(array_agg(t.name), NULL), '{}') AS blog_tags
       FROM blogs b
       LEFT JOIN blog_tags bt ON bt.blog_id = b.id
       LEFT JOIN tags t ON t.id = bt.tag_id
       WHERE b.id = $1
       GROUP BY b.id`,
      [id]
    );

    res.status(201).json(toBlogResponse(rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'A blog with that URL already exists.' });
    }

    return next(error);
  }
});

router.put('/blogs/:id', async (req, res, next) => {
  try {
    const {
      title,
      content,
      publishDate,
      author,
      status,
      category,
      coverImg,
      blogURL,
      summary,
      blogType,
      vlogContent,
      vlogEmbed,
      vlogURL,
      blogTags,
    } = req.body || {};

    const existing = await query('SELECT id, title FROM blogs WHERE id = $1 LIMIT 1', [req.params.id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    const nextTitle = title || existing.rows[0].title;
    const slug = (blogURL || slugify(nextTitle, { lower: true, strict: true })).slice(0, 120);

    await query(
      `UPDATE blogs
       SET title = $1,
           content = $2,
           publish_date = $3,
           author = $4,
           status = $5,
           category = $6,
           cover_img = $7,
           blog_url = $8,
           summary = $9,
           updated_at = NOW(),
           blog_type = $10,
           vlog_content = $11,
           vlog_embed = $12,
           vlog_url = $13
       WHERE id = $14`,
      [
        nextTitle,
        content || null,
        publishDate || null,
        author || req.user.name,
        status === 'published' ? 'published' : 'draft',
        category || null,
        coverImg || null,
        slug,
        summary || null,
        blogType === 'video' ? 'video' : 'written',
        vlogContent || null,
        vlogEmbed || null,
        vlogURL || null,
        req.params.id,
      ]
    );

    await syncBlogTags(req.params.id, blogTags);

    const { rows } = await query(
      `SELECT b.*, COALESCE(array_remove(array_agg(t.name), NULL), '{}') AS blog_tags
       FROM blogs b
       LEFT JOIN blog_tags bt ON bt.blog_id = b.id
       LEFT JOIN tags t ON t.id = bt.tag_id
       WHERE b.id = $1
       GROUP BY b.id`,
      [req.params.id]
    );

    return res.status(200).json(toBlogResponse(rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'A blog with that URL already exists.' });
    }

    return next(error);
  }
});

router.delete('/blogs/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM blogs WHERE id = $1', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get('/jobs', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM jobs ORDER BY updated_at DESC', []);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
});

router.post('/jobs', async (req, res, next) => {
  try {
    const { title, location, department, summary, applyUrl, status, publishDate } = req.body || {};

    if (!title) {
      return res.status(400).json({ message: 'Job title is required.' });
    }

    const id = makeId('job');

    await query(
      `INSERT INTO jobs (id, title, location, department, summary, apply_url, status, publish_date, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        id,
        title,
        location || null,
        department || null,
        summary || null,
        applyUrl || null,
        status === 'closed' ? 'closed' : 'open',
        publishDate || null,
      ]
    );

    const created = await query('SELECT * FROM jobs WHERE id = $1 LIMIT 1', [id]);
    res.status(201).json(created.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put('/jobs/:id', async (req, res, next) => {
  try {
    const { title, location, department, summary, applyUrl, status, publishDate } = req.body || {};

    const result = await query(
      `UPDATE jobs
       SET title = $1,
           location = $2,
           department = $3,
           summary = $4,
           apply_url = $5,
           status = $6,
           publish_date = $7,
           updated_at = NOW()
       WHERE id = $8`,
      [
        title,
        location || null,
        department || null,
        summary || null,
        applyUrl || null,
        status === 'closed' ? 'closed' : 'open',
        publishDate || null,
        req.params.id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const updated = await query('SELECT * FROM jobs WHERE id = $1 LIMIT 1', [req.params.id]);
    return res.status(200).json(updated.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.delete('/jobs/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM jobs WHERE id = $1', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get('/categories', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM categories ORDER BY name ASC', []);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
});

router.post('/categories', async (req, res, next) => {
  try {
    const { name, description } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const id = makeId('cat');
    await query('INSERT INTO categories (id, name, description, updated_at) VALUES ($1, $2, $3, NOW())', [
      id,
      name,
      description || null,
    ]);

    const created = await query('SELECT * FROM categories WHERE id = $1 LIMIT 1', [id]);
    res.status(201).json(created.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Category already exists.' });
    }

    return next(error);
  }
});

router.put('/categories/:id', async (req, res, next) => {
  try {
    const { name, description } = req.body || {};
    const result = await query(
      'UPDATE categories SET name = $1, description = $2, updated_at = NOW() WHERE id = $3',
      [name, description || null, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const updated = await query('SELECT * FROM categories WHERE id = $1 LIMIT 1', [req.params.id]);
    return res.status(200).json(updated.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Category already exists.' });
    }

    return next(error);
  }
});

router.delete('/categories/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM categories WHERE id = $1', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get('/tags', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM tags ORDER BY name ASC', []);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
});

router.post('/tags', async (req, res, next) => {
  try {
    const { name } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: 'Tag name is required.' });
    }

    const id = makeId('tag');
    await query('INSERT INTO tags (id, name, updated_at) VALUES ($1, $2, NOW())', [id, name]);
    const created = await query('SELECT * FROM tags WHERE id = $1 LIMIT 1', [id]);
    res.status(201).json(created.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Tag already exists.' });
    }

    return next(error);
  }
});

router.delete('/tags/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM tags WHERE id = $1', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Tag not found.' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get('/navigation', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT id, label, href, position, visible FROM navigation_items ORDER BY position', []);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
});

router.put('/navigation', async (req, res, next) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    await query('BEGIN');
    await query('DELETE FROM navigation_items');

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      await query(
        `INSERT INTO navigation_items (id, label, href, position, visible, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [item.id || makeId('nav'), item.label || 'Untitled', item.href || '/', i + 1, item.visible !== false]
      );
    }

    await query('COMMIT');

    const { rows } = await query('SELECT id, label, href, position, visible FROM navigation_items ORDER BY position', []);
    return res.status(200).json(rows);
  } catch (error) {
    await query('ROLLBACK');
    return next(error);
  }
});

router.get('/settings', async (_req, res, next) => {
  try {
    const settings = await query('SELECT * FROM site_settings WHERE id = $1 LIMIT 1', ['default']);
    res.status(200).json(settings.rows[0] || null);
  } catch (error) {
    next(error);
  }
});

router.put('/settings', async (req, res, next) => {
  try {
    const {
      siteTitle,
      heroTitle,
      heroSubtitle,
      primaryCtaLabel,
      primaryCtaHref,
      secondaryCtaLabel,
      secondaryCtaHref,
      accentMessage,
    } = req.body || {};

    await query(
      `UPDATE site_settings
       SET site_title = $1,
           hero_title = $2,
           hero_subtitle = $3,
           primary_cta_label = $4,
           primary_cta_href = $5,
           secondary_cta_label = $6,
           secondary_cta_href = $7,
           accent_message = $8,
           updated_at = NOW()
       WHERE id = $9`,
      [
        siteTitle,
        heroTitle,
        heroSubtitle,
        primaryCtaLabel,
        primaryCtaHref,
        secondaryCtaLabel,
        secondaryCtaHref,
        accentMessage,
        'default',
      ]
    );

    const updated = await query('SELECT * FROM site_settings WHERE id = $1 LIMIT 1', ['default']);
    return res.status(200).json(updated.rows[0]);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
