const slugify = require('slugify');
const { query } = require('../config/db');

const mapCategoryRow = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getCategories = async () => {
  const result = await query(
    `SELECT id, name, slug, description, created_at, updated_at
       FROM categories
      ORDER BY name ASC`
  );

  return result.rows.map(mapCategoryRow);
};

const getCategoryById = async (id) => {
  const result = await query('SELECT * FROM categories WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] ? mapCategoryRow(result.rows[0]) : null;
};

const getCategoryBySlug = async (slug) => {
  const result = await query('SELECT * FROM categories WHERE slug = $1 LIMIT 1', [slug]);
  return result.rows[0] ? mapCategoryRow(result.rows[0]) : null;
};

const ensureSlug = async (desiredSlug, excludeId = null) => {
  let candidate = desiredSlug;
  let counter = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const params = [candidate];
    let statement = 'SELECT 1 FROM categories WHERE slug = $1';

    if (excludeId) {
      statement += ' AND id <> $2';
      params.push(excludeId);
    }

    const existing = await query(statement, params);

    if (existing.rowCount === 0) {
      return candidate;
    }

    counter += 1;
    candidate = `${desiredSlug}-${counter}`;
  }
};

const createCategory = async ({ name, slug, description }) => {
  const desiredSlug =
    slug?.trim() || slugify(name, { lower: true, strict: true, trim: true });
  const uniqueSlug = await ensureSlug(desiredSlug);

  const result = await query(
    `INSERT INTO categories (name, slug, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name.trim(), uniqueSlug, description || null]
  );

  return mapCategoryRow(result.rows[0]);
};

const updateCategory = async (id, { name, slug, description }) => {
  const existing = await getCategoryById(id);
  if (!existing) {
    return null;
  }

  const updates = [];
  const values = [];

  if (name !== undefined) {
    updates.push(`name = $${updates.length + 1}`);
    values.push(name.trim());
  }

  if (description !== undefined) {
    updates.push(`description = $${updates.length + 1}`);
    values.push(description);
  }

  if (slug !== undefined) {
    const desiredSlug =
      slug?.trim() || slugify(name || existing.name, { lower: true, strict: true });
    const uniqueSlug = await ensureSlug(desiredSlug, id);
    updates.push(`slug = $${updates.length + 1}`);
    values.push(uniqueSlug);
  }

  updates.push(`updated_at = NOW()`);

  const result = await query(
    `UPDATE categories
        SET ${updates.join(', ')}
      WHERE id = $${updates.length + 1}
      RETURNING *`,
    [...values, id]
  );

  return result.rows[0] ? mapCategoryRow(result.rows[0]) : null;
};

const deleteCategory = async (id) => {
  const result = await query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] ? mapCategoryRow(result.rows[0]) : null;
};

module.exports = {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
};
