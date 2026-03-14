// controllers/disasterController.js
// CRUD for disasters.
// GET endpoints are open; POST/PATCH are restricted to admin/agency roles.

const pool = require('../config/db');

// GET /api/disasters — returns all disasters, most recent first
const getAllDisasters = async (req, res) => {
  const { status } = req.query; // optional ?status=active filter
  let query = 'SELECT * FROM disasters';
  const params = [];

  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }

  query += ' ORDER BY started_at DESC';
  const [rows] = await pool.query(query, params);
  res.json(rows);
};

// GET /api/disasters/summary — uses the active_disaster_summary VIEW
const getSummary = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM active_disaster_summary');
  res.json(rows);
};

// GET /api/disasters/:id
const getDisasterById = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM disasters WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Disaster not found' });
  res.json(rows[0]);
};

// POST /api/disasters — admin or agency only
const createDisaster = async (req, res) => {
  const { title, type, severity, description, location, lat, lng } = req.body;

  if (!title || !type || !location) {
    return res.status(400).json({ message: 'title, type and location are required' });
  }

  const [result] = await pool.query(
    `INSERT INTO disasters (title, type, severity, description, location, lat, lng, created_by)
     VALUES (?,?,?,?,?,?,?,?)`,
    [title, type, severity || 'medium', description, location, lat, lng, req.user.id]
  );

  await pool.query(
    'INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?,?,?,?,?)',
    [req.user.id, 'DISASTER_CREATED', 'disasters', result.insertId, title]
  );

  res.status(201).json({ id: result.insertId, message: 'Disaster created' });
};

// PATCH /api/disasters/:id/status
const updateStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ['active', 'contained', 'closed'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  await pool.query('UPDATE disasters SET status = ? WHERE id = ?', [status, req.params.id]);

  await pool.query(
    'INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?,?,?,?,?)',
    [req.user.id, 'DISASTER_STATUS_UPDATE', 'disasters', req.params.id, status]
  );

  res.json({ message: 'Status updated' });
};

// GET /api/disasters/:id/zones — all zones for a disaster
const getZones = async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM affected_zones WHERE disaster_id = ? ORDER BY severity DESC',
    [req.params.id]
  );
  res.json(rows);
};

// GET /api/disasters/:id/announcements
const getAnnouncements = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.*, u.name AS posted_by_name
     FROM announcements a
     LEFT JOIN users u ON u.id = a.posted_by
     WHERE a.disaster_id = ?
     ORDER BY a.created_at DESC`,
    [req.params.id]
  );
  res.json(rows);
};

module.exports = { getAllDisasters, getSummary, getDisasterById, createDisaster, updateStatus, getZones, getAnnouncements };
