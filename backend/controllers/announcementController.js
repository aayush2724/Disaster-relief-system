// controllers/announcementController.js
const pool = require('../config/db');

// POST /api/announcements
const createAnnouncement = async (req, res) => {
  const { disaster_id, title, message, severity } = req.body;
  if (!disaster_id || !title || !message) {
    return res.status(400).json({ message: 'disaster_id, title, message required' });
  }
  const [result] = await pool.query(
    'INSERT INTO announcements (disaster_id, posted_by, title, message, severity) VALUES (?,?,?,?,?)',
    [disaster_id, req.user.id, title, message, severity || 'info']
  );
  res.status(201).json({ id: result.insertId });
};

// GET /api/announcements — latest across all disasters
const getAllAnnouncements = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.*, u.name AS posted_by_name, d.title AS disaster_title
     FROM announcements a
     LEFT JOIN users u ON u.id = a.posted_by
     LEFT JOIN disasters d ON d.id = a.disaster_id
     ORDER BY a.created_at DESC LIMIT 50`
  );
  res.json(rows);
};

module.exports = { createAnnouncement, getAllAnnouncements };
