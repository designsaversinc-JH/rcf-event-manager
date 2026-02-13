require('dotenv').config();

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const slugify = require('slugify');
const { query, pool, runMigrations } = require('../src/config/db');

const FIRESTORE_COLLECTIONS = ['categories', 'tags', 'blogs'];

const getRequiredEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const normalizeTimestamp = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return null;
};

const normalizeStatus = (value) => (String(value || '').toLowerCase() === 'published' ? 'published' : 'draft');

const normalizeBlogType = (data) => {
  const explicitType = String(data.blogType || '').toLowerCase();
  if (explicitType === 'video') {
    return 'video';
  }

  if (explicitType === 'written') {
    return 'written';
  }

  if (data.vlogContent || data.vlogEmbed || data.vlogVideoEmbeded || data.vlogURL || data.VlogURL) {
    return 'video';
  }

  return 'written';
};

const ensureTag = async (tagName) => {
  const trimmed = String(tagName || '').trim();
  if (!trimmed) {
    return null;
  }

  const existing = await query('SELECT id FROM tags WHERE lower(name) = lower($1) LIMIT 1', [trimmed]);
  if (existing.rows[0]?.id) {
    return existing.rows[0].id;
  }

  const tagId = `tag-${slugify(trimmed, { lower: true, strict: true }).slice(0, 32) || Date.now()}`;
  await query(
    `INSERT INTO tags (id, name, created_at, updated_at)
     VALUES ($1, $2, NOW(), NOW())
     ON CONFLICT (id)
     DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()`,
    [tagId, trimmed]
  );

  return tagId;
};

const initFirestore = () => {
  const projectId = getRequiredEnv('FIREBASE_PROJECT_ID');
  const clientEmail = getRequiredEnv('FIREBASE_CLIENT_EMAIL');
  const privateKey = getRequiredEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  return getFirestore();
};

const importCategories = async (db) => {
  const snapshot = await db.collection('categories').get();
  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() || {};
    const id = String(data.id || doc.id);
    const name = String(data.name || '').trim();

    if (!name) {
      continue;
    }

    const normalizedUpdatedAt = normalizeTimestamp(data.updatedAt);
    const normalizedCreatedAt = normalizeTimestamp(data.createdAt);
    const description = data.description ? String(data.description) : null;

    // Name is unique in Neon. Prefer merging by name to avoid duplicate-key
    // errors when Firestore id differs from an existing seeded row.
    const existingByName = await query(
      'SELECT id FROM categories WHERE lower(name) = lower($1) LIMIT 1',
      [name]
    );

    if (existingByName.rows[0]?.id) {
      await query(
        `UPDATE categories
         SET description = $1,
             updated_at = COALESCE($2::timestamptz, NOW())
         WHERE id = $3`,
        [description, normalizedUpdatedAt, existingByName.rows[0].id]
      );
      count += 1;
      continue;
    }

    await query(
      `INSERT INTO categories (id, name, description, updated_at, created_at)
       VALUES ($1, $2, $3, COALESCE($4::timestamptz, NOW()), COALESCE($5::timestamptz, NOW()))
       ON CONFLICT (id)
       DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         updated_at = EXCLUDED.updated_at`,
      [id, name, description, normalizedUpdatedAt, normalizedCreatedAt]
    );

    count += 1;
  }

  return count;
};

const importTags = async (db) => {
  const snapshot = await db.collection('tags').get();
  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() || {};
    const id = String(data.id || doc.id);
    const name = String(data.name || '').trim();

    if (!name) {
      continue;
    }

    const normalizedUpdatedAt = normalizeTimestamp(data.updatedAt);
    const normalizedCreatedAt = normalizeTimestamp(data.createdAt);

    const existingByName = await query(
      'SELECT id FROM tags WHERE lower(name) = lower($1) LIMIT 1',
      [name]
    );

    if (existingByName.rows[0]?.id) {
      await query(
        `UPDATE tags
         SET updated_at = COALESCE($1::timestamptz, NOW())
         WHERE id = $2`,
        [normalizedUpdatedAt, existingByName.rows[0].id]
      );
      count += 1;
      continue;
    }

    await query(
      `INSERT INTO tags (id, name, updated_at, created_at)
       VALUES ($1, $2, COALESCE($3::timestamptz, NOW()), COALESCE($4::timestamptz, NOW()))
       ON CONFLICT (id)
       DO UPDATE SET
         name = EXCLUDED.name,
         updated_at = EXCLUDED.updated_at`,
      [id, name, normalizedUpdatedAt, normalizedCreatedAt]
    );

    count += 1;
  }

  return count;
};

const importBlogs = async (db) => {
  const snapshot = await db.collection('blogs').get();
  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() || {};
    const id = String(data.id || doc.id);
    const title = String(data.title || '').trim();

    if (!title) {
      continue;
    }

    const blogUrl = String(data.blogURL || slugify(title, { lower: true, strict: true })).slice(0, 120);

    const payload = [
      title,
      data.content ? String(data.content) : null,
      normalizeTimestamp(data.publishDate),
      data.author ? String(data.author) : null,
      normalizeStatus(data.status),
      data.category ? String(data.category) : null,
      data.coverImg ? String(data.coverImg) : null,
      blogUrl,
      data.summary ? String(data.summary) : null,
      normalizeTimestamp(data.updatedAt),
      normalizeTimestamp(data.createdAt),
      normalizeBlogType(data),
      data.vlogContent ? String(data.vlogContent) : null,
      data.vlogEmbed ? String(data.vlogEmbed) : data.vlogVideoEmbeded ? String(data.vlogVideoEmbeded) : null,
      data.vlogURL ? String(data.vlogURL) : data.VlogURL ? String(data.VlogURL) : null,
    ];

    const existingById = await query('SELECT id FROM blogs WHERE id = $1 LIMIT 1', [id]);
    const existingByUrl = await query('SELECT id FROM blogs WHERE blog_url = $1 LIMIT 1', [blogUrl]);
    const existingId = existingById.rows[0]?.id || null;
    const existingUrlId = existingByUrl.rows[0]?.id || null;
    const targetBlogId = existingUrlId || existingId || id;

    // If Firestore id and blog_url point at different rows, keep the blog_url row
    // (it satisfies the unique slug constraint) and remove the duplicate id row.
    if (existingId && existingUrlId && existingId !== existingUrlId) {
      await query('DELETE FROM blog_tags WHERE blog_id = $1', [existingId]);
      await query('DELETE FROM blogs WHERE id = $1', [existingId]);
    }

    if (existingId || existingUrlId) {
      await query(
        `UPDATE blogs
         SET title = $1,
             content = $2,
             publish_date = $3::timestamptz,
             author = $4,
             status = $5,
             category = $6,
             cover_img = $7,
             blog_url = $8,
             summary = $9,
             updated_at = COALESCE($10::timestamptz, NOW()),
             created_at = COALESCE($11::timestamptz, created_at),
             blog_type = $12,
             vlog_content = $13,
             vlog_embed = $14,
             vlog_url = $15
         WHERE id = $16`,
        [...payload, targetBlogId]
      );
    } else {
      await query(
        `INSERT INTO blogs (
          id, title, content, publish_date, author, status, category, cover_img, blog_url,
          summary, updated_at, created_at, blog_type, vlog_content, vlog_embed, vlog_url
        ) VALUES (
          $1, $2, $3, $4::timestamptz, $5, $6, $7, $8, $9,
          $10, COALESCE($11::timestamptz, NOW()), COALESCE($12::timestamptz, NOW()),
          $13, $14, $15, $16
        )`,
        [id, ...payload]
      );
    }

    await query('DELETE FROM blog_tags WHERE blog_id = $1', [targetBlogId]);

    const blogTags = Array.isArray(data.blogTags) ? data.blogTags : [];
    for (const rawTag of blogTags) {
      const tagId = await ensureTag(rawTag);
      if (!tagId) {
        continue;
      }

      await query(
        'INSERT INTO blog_tags (blog_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [targetBlogId, tagId]
      );
    }

    count += 1;
  }

  return count;
};

const assertCollectionsExist = async (db) => {
  const collections = await db.listCollections();
  const names = new Set(collections.map((collection) => collection.id));

  const missing = FIRESTORE_COLLECTIONS.filter((name) => !names.has(name));
  if (missing.length > 0) {
    console.warn(`[import] Missing collections in Firestore: ${missing.join(', ')}`);
  }
};

const run = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required to import into Neon/PostgreSQL.');
    }

    const db = initFirestore();
    await runMigrations();
    await assertCollectionsExist(db);

    const categories = await importCategories(db);
    const tags = await importTags(db);
    const blogs = await importBlogs(db);

    console.info('[import] Firestore -> Neon completed');
    console.info(`[import] categories: ${categories}`);
    console.info(`[import] tags: ${tags}`);
    console.info(`[import] blogs: ${blogs}`);
  } catch (error) {
    console.error('[import] Failed to import Firestore collections', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
