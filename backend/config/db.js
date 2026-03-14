// config/db.js
// ============================================================
// Database connection pool using mysql2/promise.
// A pool (not a single connection) is used so multiple requests
// can be served simultaneously without waiting for each other.
// All DB calls in the app use pool.query() or pool.execute().
// ============================================================

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'disaster_relief',
  waitForConnections: true,
  connectionLimit:    10,   // max simultaneous connections in pool
  queueLimit:         0,    // unlimited queued requests
});

module.exports = pool;
