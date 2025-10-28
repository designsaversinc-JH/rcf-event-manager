const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';
const shouldForceSSL = process.env.PGSSLMODE === 'require';

if (!connectionString) {
  console.warn(
    '[database] DATABASE_URL is not set. The API will not be able to connect to PostgreSQL.'
  );
}

const sslConfig =
  shouldForceSSL || isProduction
    ? {
        rejectUnauthorized: false,
      }
    : undefined;

const pool = new Pool({
  connectionString,
  ssl: sslConfig,
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT || 30_000),
});

pool.on('error', (error) => {
  console.error('[database] Unexpected error on idle client', error);
});

const query = (text, params) => pool.query(text, params);

const runMigrations = async () => {
  if (!connectionString) {
    return;
  }

  const schemaFile = path.join(__dirname, '..', '..', 'db', 'schema.sql');
  if (!fs.existsSync(schemaFile)) {
    return;
  }

  const ddl = fs.readFileSync(schemaFile, 'utf8');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(ddl);
    await client.query('COMMIT');
    console.info('[database] Database schema ensured');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[database] Failed to run migrations', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  runMigrations,
};
