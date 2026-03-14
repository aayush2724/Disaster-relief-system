// controllers/authController.js
// Handles user registration and login.
// Passwords are hashed with bcrypt (cost factor 10) before storage.
// Login returns a signed JWT used for all subsequent requests.

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const allowedRoles = ['admin', 'ngo', 'volunteer', 'agency'];
  const userRole = allowedRoles.includes(role) ? role : 'volunteer';

  const hash = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?,?,?,?,?)',
    [name, email, hash, userRole, phone || null]
  );

  // Log the registration action
  await pool.query(
    'INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES (?,?,?,?)',
    [result.insertId, 'USER_REGISTER', 'users', result.insertId]
  );

  const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  res.status(201).json({ token, user: { id: result.insertId, name, email, role: userRole } });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (!rows.length) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  await pool.query(
    'INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES (?,?,?,?)',
    [user.id, 'USER_LOGIN', 'users', user.id]
  );

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

// GET /api/auth/me — returns the currently logged-in user
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };
