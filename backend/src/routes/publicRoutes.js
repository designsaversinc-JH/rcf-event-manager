const express = require('express');
const { query } = require('../config/db');
const { normalizePageContent } = require('../utils/pageContentDefaults');
const { getHelpContent } = require('../utils/helpContent');

const router = express.Router();

const setCacheHeaders = (res, maxAgeSeconds) => {
  res.set(
    'Cache-Control',
    `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, stale-while-revalidate=86400`
  );
};

router.get('/help', async (_req, res) => {
  setCacheHeaders(res, 300);
  return res.status(200).json(getHelpContent());
});

const mapBlog = (row) => ({
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

router.get('/landing', async (_req, res, next) => {
  try {
    setCacheHeaders(res, 300);
    const [settingsResult, navResult, blogsResult, jobsResult, categoriesResult, tagsResult] =
      await Promise.all([
        query('SELECT * FROM site_settings WHERE id = $1 LIMIT 1', ['default']),
        query('SELECT id, label, href, position, visible FROM navigation_items ORDER BY position ASC'),
        query(
          `SELECT b.*, COALESCE(array_remove(array_agg(t.name), NULL), '{}') AS blog_tags
           FROM blogs b
           LEFT JOIN blog_tags bt ON bt.blog_id = b.id
           LEFT JOIN tags t ON t.id = bt.tag_id
           WHERE b.status = 'published'
           GROUP BY b.id
           ORDER BY b.publish_date DESC NULLS LAST, b.created_at DESC`,
          []
        ),
        query(
          `SELECT id, title, location, department, summary, apply_url, status, publish_date, created_at, updated_at
           FROM jobs
           WHERE status = 'open'
           ORDER BY publish_date DESC NULLS LAST, created_at DESC`,
          []
        ),
        query('SELECT id, name, description, updated_at, created_at FROM categories ORDER BY name ASC'),
        query('SELECT id, name, updated_at, created_at FROM tags ORDER BY name ASC'),
      ]);

    res.status(200).json({
      settings: settingsResult.rows[0]
        ? {
            ...settingsResult.rows[0],
            page_content: normalizePageContent(settingsResult.rows[0].page_content),
          }
        : null,
      navigation: navResult.rows,
      blogs: blogsResult.rows.map(mapBlog),
      jobs: jobsResult.rows,
      categories: categoriesResult.rows,
      tags: tagsResult.rows,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/blogs', async (_req, res, next) => {
  try {
    setCacheHeaders(res, 300);
    const { rows } = await query(
      `SELECT b.*, COALESCE(array_remove(array_agg(t.name), NULL), '{}') AS blog_tags
       FROM blogs b
       LEFT JOIN blog_tags bt ON bt.blog_id = b.id
       LEFT JOIN tags t ON t.id = bt.tag_id
       WHERE b.status = 'published'
       GROUP BY b.id
       ORDER BY b.publish_date DESC NULLS LAST, b.created_at DESC`,
      []
    );

    res.status(200).json(rows.map(mapBlog));
  } catch (error) {
    next(error);
  }
});

router.get('/blogs/:identifier', async (req, res, next) => {
  try {
    setCacheHeaders(res, 300);
    const identifier = req.params.identifier;
    const { rows } = await query(
      `SELECT b.*, COALESCE(array_remove(array_agg(t.name), NULL), '{}') AS blog_tags
       FROM blogs b
       LEFT JOIN blog_tags bt ON bt.blog_id = b.id
       LEFT JOIN tags t ON t.id = bt.tag_id
       WHERE (b.id = $1 OR b.blog_url = $1)
         AND b.status = 'published'
       GROUP BY b.id
       LIMIT 1`,
      [identifier]
    );

    const blog = rows[0];

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    return res.status(200).json(mapBlog(blog));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
