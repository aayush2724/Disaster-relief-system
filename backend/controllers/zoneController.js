// controllers/zoneController.js
const pool = require('../config/db');

const createZone = async (req, res) => {
  const { disaster_id, zone_name, population_affected, severity, lat, lng, notes } = req.body;
  const [result] = await pool.query(
    `INSERT INTO affected_zones (disaster_id, zone_name, population_affected, severity, lat, lng, notes)
     VALUES (?,?,?,?,?,?,?)`,
    [disaster_id, zone_name, population_affected || 0, severity || 'medium', lat, lng, notes]
  );
  res.status(201).json({ id: result.insertId, message: 'Zone created' });
};

const getZoneById = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM affected_zones WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Zone not found' });
  res.json(rows[0]);
};

const getZoneReports = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT zr.*, u.name AS submitted_by_name
     FROM zone_reports zr LEFT JOIN users u ON u.id = zr.submitted_by
     WHERE zr.zone_id = ? ORDER BY zr.created_at DESC`,
    [req.params.id]
  );
  res.json(rows);
};

const submitZoneReport = async (req, res) => {
  const { zone_id, casualties, injuries, infrastructure_damage, notes } = req.body;
  const [result] = await pool.query(
    `INSERT INTO zone_reports (zone_id, submitted_by, casualties, injuries, infrastructure_damage, notes)
     VALUES (?,?,?,?,?,?)`,
    [zone_id, req.user.id, casualties || 0, injuries || 0, infrastructure_damage, notes]
  );
  res.status(201).json({ id: result.insertId, message: 'Report submitted' });
};

module.exports = { createZone, getZoneById, getZoneReports, submitZoneReport };
