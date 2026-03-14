// controllers/volunteerController.js
// Manages volunteer profiles and uses the dispatch_volunteer stored procedure
// to safely assign volunteers to zones inside a DB transaction.

const pool = require('../config/db');

// GET /api/volunteers — all volunteers with user info joined
const getAllVolunteers = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT v.*, u.name, u.email, u.phone,
            az.zone_name AS assigned_zone
     FROM volunteers v
     JOIN users u ON u.id = v.user_id
     LEFT JOIN affected_zones az ON az.id = v.assigned_zone_id
     ORDER BY v.status`
  );
  res.json(rows);
};

// GET /api/volunteers/available — only idle volunteers
const getAvailableVolunteers = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT v.*, u.name, u.email, u.phone
     FROM volunteers v
     JOIN users u ON u.id = v.user_id
     WHERE v.status = 'idle' AND v.availability = TRUE`
  );
  res.json(rows);
};

// POST /api/volunteers/dispatch
// Calls the dispatch_volunteer() stored procedure which runs inside a transaction.
// The SP checks the volunteer is idle before inserting the dispatch log.
const dispatchVolunteer = async (req, res) => {
  const { volunteer_id, zone_id, notes } = req.body;

  if (!volunteer_id || !zone_id) {
    return res.status(400).json({ message: 'volunteer_id and zone_id are required' });
  }

  // CALL the stored procedure — MySQL handles the transaction internally
  await pool.query('CALL dispatch_volunteer(?, ?, ?)', [volunteer_id, zone_id, notes || null]);

  await pool.query(
    'INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?,?,?,?,?)',
    [req.user.id, 'VOLUNTEER_DISPATCHED', 'volunteers', volunteer_id, `Zone ${zone_id}`]
  );

  res.json({ message: 'Volunteer dispatched successfully' });
};

// POST /api/volunteers/return/:volunteerId
// Sets returned_at on the latest open dispatch log — the trigger handles the rest.
const returnVolunteer = async (req, res) => {
  const { volunteerId } = req.params;

  const [logs] = await pool.query(
    `SELECT id FROM dispatch_logs WHERE volunteer_id = ? AND returned_at IS NULL ORDER BY dispatched_at DESC LIMIT 1`,
    [volunteerId]
  );

  if (!logs.length) {
    return res.status(404).json({ message: 'No active dispatch found for this volunteer' });
  }

  await pool.query('UPDATE dispatch_logs SET returned_at = NOW() WHERE id = ?', [logs[0].id]);

  res.json({ message: 'Volunteer marked as returned' });
};

// POST /api/volunteers/profile — create volunteer profile for current user
const createProfile = async (req, res) => {
  const { skills } = req.body;
  const [existing] = await pool.query('SELECT id FROM volunteers WHERE user_id = ?', [req.user.id]);
  if (existing.length) return res.status(400).json({ message: 'Profile already exists' });

  const [result] = await pool.query(
    'INSERT INTO volunteers (user_id, skills) VALUES (?, ?)',
    [req.user.id, JSON.stringify(skills || [])]
  );
  res.status(201).json({ id: result.insertId });
};

// GET /api/volunteers/:id/logs — dispatch history
const getDispatchLogs = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT dl.*, az.zone_name, d.title AS disaster_title
     FROM dispatch_logs dl
     JOIN affected_zones az ON az.id = dl.zone_id
     JOIN disasters d ON d.id = az.disaster_id
     WHERE dl.volunteer_id = ?
     ORDER BY dl.dispatched_at DESC`,
    [req.params.id]
  );
  res.json(rows);
};

module.exports = { getAllVolunteers, getAvailableVolunteers, dispatchVolunteer, returnVolunteer, createProfile, getDispatchLogs };
