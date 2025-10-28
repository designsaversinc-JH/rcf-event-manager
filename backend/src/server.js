require('dotenv').config();

const http = require('http');
const app = require('./app');
const { pool, runMigrations } = require('./config/db');

const port = Number(process.env.PORT || 5000);

const startServer = async () => {
  try {
    await runMigrations();

    const client = await pool.connect();
    client.release();

    http.createServer(app).listen(port, () => {
      console.info(`[server] API listening on port ${port}`);
    });
  } catch (error) {
    console.error('[server] Failed to start server', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (error) => {
  console.error('[server] Unhandled promise rejection', error);
});

process.on('SIGTERM', () => {
  console.info('[server] SIGTERM received, closing database connections.');
  pool.end(() => {
    process.exit(0);
  });
});

startServer();

module.exports = app;
