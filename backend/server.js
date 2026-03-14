require('dotenv').config();
const express  = require('express');
const cors     = require('cors');

const authRoutes         = require('./routes/auth');
const disasterRoutes     = require('./routes/disasters');
const zoneRoutes         = require('./routes/zones');
const volunteerRoutes    = require('./routes/volunteers');
const supplyRoutes       = require('./routes/supply');
const announcementRoutes = require('./routes/announcements');
const dashboardRoutes    = require('./routes/dashboard');

const app = express();

app.use(cors());
app.use(express.json());

// Wrap async routes to catch unhandled promise rejections
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.use('/api/auth',          authRoutes);
app.use('/api/disasters',     disasterRoutes);
app.use('/api/zones',         zoneRoutes);
app.use('/api/volunteers',    volunteerRoutes);
app.use('/api/supply',        supplyRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/dashboard',     dashboardRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Global error handler — now prints full error
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err.message);
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚨 Relief API running on port ${PORT}`));