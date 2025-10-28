const { pool, query } = require('../config/db');

const mapUserRow = (row) => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  role: row.role,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const countUsers = async () => {
  const result = await query('SELECT COUNT(*)::INT AS count FROM users');
  return result.rows[0]?.count || 0;
};

const getUserByEmail = async (email) => {
  const result = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
};

const getUserById = async (id) => {
  const result = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
};

const getUsers = async () => {
  const result = await query(
    `SELECT id,
            first_name,
            last_name,
            email,
            role,
            is_active,
            created_at,
            updated_at
       FROM users
      ORDER BY created_at DESC`
  );

  return result.rows.map(mapUserRow);
};

const createUser = async ({
  firstName,
  lastName,
  email,
  passwordHash,
  role = 'viewer',
}) => {
  const result = await query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [firstName, lastName, email.toLowerCase(), passwordHash, role]
  );

  return mapUserRow(result.rows[0]);
};

const updateUserRole = async (id, role) => {
  const result = await query(
    `UPDATE users
        SET role = $1,
            updated_at = NOW()
      WHERE id = $2
      RETURNING *`,
    [role, id]
  );

  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
};

const updateUserStatus = async (id, isActive) => {
  const result = await query(
    `UPDATE users
        SET is_active = $1,
            updated_at = NOW()
      WHERE id = $2
      RETURNING *`,
    [isActive, id]
  );

  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
};

const getPasswordHashForUser = async (email) => {
  const result = await query(
    `SELECT id,
            email,
            password_hash,
            role,
            first_name,
            last_name,
            is_active,
            created_at,
            updated_at
       FROM users
      WHERE email = $1
      LIMIT 1`,
    [email]
  );

  if (!result.rows[0]) {
    return null;
  }

  const row = result.rows[0];
  return {
    user: mapUserRow(row),
    passwordHash: row.password_hash,
  };
};

const deleteUser = async (id) => {
  const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
};

const beginTransaction = () => pool.connect();

module.exports = {
  beginTransaction,
  countUsers,
  createUser,
  deleteUser,
  getPasswordHashForUser,
  getUserByEmail,
  getUserById,
  getUsers,
  updateUserRole,
  updateUserStatus,
};
