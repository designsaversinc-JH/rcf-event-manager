const slugify = require('slugify');
const { pool, query } = require('../config/db');

const mapPostRow = (row) => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  excerpt: row.excerpt,
  content: row.content,
  coverImageUrl: row.cover_image_url,
  status: row.status,
  publishedAt: row.published_at,
  authorId: row.author_id,
  authorName: row.author_name,
  isFeatured: row.is_featured,
  categories: row.categories || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const baseSelect = `
  SELECT p.*,
         CONCAT(u.first_name, ' ', u.last_name) AS author_name,
         COALESCE(
           json_agg(
             DISTINCT jsonb_build_object(
               'id', c.id,
               'name', c.name,
               'slug', c.slug
             )
           ) FILTER (WHERE c.id IS NOT NULL),
           '[]'
         ) AS categories
    FROM posts p
    LEFT JOIN users u ON u.id = p.author_id
    LEFT JOIN post_categories pc ON pc.post_id = p.id
    LEFT JOIN categories c ON c.id = pc.category_id
`;

const baseFrom = `
  FROM posts p
  LEFT JOIN post_categories pc ON pc.post_id = p.id
  LEFT JOIN categories c ON c.id = pc.category_id
`;

const buildWhereClause = (conditions) =>
  conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

const getPosts = async (options = {}) => {
  const {
    status,
    categoryId,
    search,
    page = 1,
    limit = 12,
    featured,
    includeDrafts = false,
  } = options;

  const conditions = [];
  const params = [];

  const addCondition = (clause, value) => {
    const index = params.length + 1;
    conditions.push(clause(index));
    params.push(value);
  };

  if (!includeDrafts && !status) {
    conditions.push(`p.status = 'published'`);
  }

  if (status) {
    addCondition((idx) => `p.status = $${idx}`, status);
  }

  if (typeof featured === 'boolean') {
    addCondition((idx) => `p.is_featured = $${idx}`, featured);
  }

  if (search) {
    addCondition(
      (idx) =>
        `(p.title ILIKE $${idx} OR p.excerpt ILIKE $${idx} OR p.content ILIKE $${idx})`,
      `%${search}%`
    );
  }

  if (categoryId) {
    addCondition((idx) => `pc.category_id = $${idx}`, categoryId);
  }

  const whereClause = buildWhereClause(conditions);
  const orderClause = 'ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC';

  const paginationLimit = Math.min(limit, 100);
  const offset = (page - 1) * paginationLimit;

  const dataQuery = `
    ${baseSelect}
    ${baseFrom}
    ${whereClause}
    GROUP BY p.id, u.first_name, u.last_name
    ${orderClause}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;

  const dataParams = [...params, paginationLimit, offset];
  const result = await query(dataQuery, dataParams);
  const posts = result.rows.map(mapPostRow);

  const countQuery = `
    SELECT COUNT(DISTINCT p.id) AS total
    ${baseFrom}
    ${whereClause}
  `;

  const countResult = await query(countQuery, params);
  const total = Number(countResult.rows[0]?.total || 0);

  return {
    posts,
    total,
    page,
    limit: paginationLimit,
    totalPages: Math.ceil(total / paginationLimit) || 1,
  };
};

const getPostByField = async (field, value) => {
  const result = await query(
    `
      ${baseSelect}
      ${baseFrom}
      WHERE ${field} = $1
      GROUP BY p.id, u.first_name, u.last_name
      LIMIT 1
    `,
    [value]
  );

  return result.rows[0] ? mapPostRow(result.rows[0]) : null;
};

const getPostById = (id) => getPostByField('p.id', id);
const getPostBySlug = (slug) => getPostByField('p.slug', slug);

const generateUniqueSlug = async (client, desiredSlug, excludeId = null) => {
  let candidate = desiredSlug;
  let counter = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const params = [candidate];
    let queryText = 'SELECT 1 FROM posts WHERE slug = $1';

    if (excludeId) {
      params.push(excludeId);
      queryText += ' AND id <> $2';
    }

    const existing = await client.query(queryText, params);

    if (existing.rowCount === 0) {
      return candidate;
    }

    counter += 1;
    candidate = `${desiredSlug}-${counter}`;
  }
};

const setPostCategories = async (client, postId, categoryIds = []) => {
  await client.query('DELETE FROM post_categories WHERE post_id = $1', [postId]);

  if (!categoryIds.length) {
    return;
  }

  await client.query(
    `INSERT INTO post_categories (post_id, category_id)
     SELECT $1, UNNEST($2::int[])
     ON CONFLICT DO NOTHING`,
    [postId, categoryIds]
  );
};

const createPost = async ({
  title,
  excerpt,
  content,
  coverImageUrl,
  status = 'draft',
  publishedAt = null,
  authorId,
  categories = [],
  isFeatured = false,
}) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const baseSlug = slugify(title, { lower: true, strict: true });
    const slug = await generateUniqueSlug(client, baseSlug);

    const insertResult = await client.query(
      `INSERT INTO posts (title, slug, excerpt, content, cover_image_url, status, published_at, author_id, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        title,
        slug,
        excerpt,
        content,
        coverImageUrl,
        status,
        status === 'published' && !publishedAt ? new Date() : publishedAt,
        authorId,
        isFeatured,
      ]
    );

    const post = insertResult.rows[0];
    await setPostCategories(client, post.id, categories);
    await client.query('COMMIT');

    return getPostById(post.id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updatePost = async (id, payload = {}) => {
  const {
    title,
    excerpt,
    content,
    coverImageUrl,
    status,
    publishedAt,
    categories,
    isFeatured,
  } = payload;

  const existing = await getPostById(id);
  if (!existing) {
    return null;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let slug = existing.slug;
    if (title && title !== existing.title) {
      const baseSlug = slugify(title, { lower: true, strict: true });
      slug = await generateUniqueSlug(client, baseSlug, id);
    }

    const updateFields = [];
    const updateValues = [];
    const setField = (column, value) => {
      updateFields.push(`${column} = $${updateFields.length + 1}`);
      updateValues.push(value);
    };

    if (title !== undefined) setField('title', title);
    if (excerpt !== undefined) setField('excerpt', excerpt);
    if (content !== undefined) setField('content', content);
    if (coverImageUrl !== undefined) setField('cover_image_url', coverImageUrl);
    if (status !== undefined) setField('status', status);
    if (isFeatured !== undefined) setField('is_featured', isFeatured);
    if (publishedAt !== undefined) setField('published_at', publishedAt);

    if (slug !== existing.slug) {
      setField('slug', slug);
    }

    if (status === 'published' && !existing.publishedAt && !publishedAt) {
      setField('published_at', new Date());
    }

    setField('updated_at', new Date());

    if (updateFields.length) {
      await client.query(
        `UPDATE posts SET ${updateFields.join(', ')} WHERE id = $${
          updateFields.length + 1
        }`,
        [...updateValues, id]
      );
    }

    if (Array.isArray(categories)) {
      await setPostCategories(client, id, categories);
    }

    await client.query('COMMIT');

    return getPostById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const deletePost = async (id) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM post_categories WHERE post_id = $1', [id]);
    const result = await client.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
    await client.query('COMMIT');
    return result.rows[0] ? mapPostRow(result.rows[0]) : null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
};
