// middleware/auth.js
// Two middleware functions used on protected routes:
//
//   protect       — verifies JWT, attaches req.user
//   authorise     — checks req.user.role against allowed roles
//
// Usage in routes:
//   router.post('/disasters', protect, authorise('admin','agency'), createDisaster)

const jwt  = require('jsonwebtoken');
const pool = require('../config/db');

// Verifies the Bearer token in the Authorization header.
// Attaches the full user row to req.user so downstream handlers know who's calling.
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Factory that returns a middleware checking the user's role.
// Pass one or more allowed roles: authorise('admin', 'agency')
const authorise = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Role '${req.user.role}' is not permitted to perform this action`
    });
  }
  next();
};

module.exports = { protect, authorise };
