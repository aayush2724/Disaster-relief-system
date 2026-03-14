// controllers/dashboardController.js
// Aggregates platform-wide stats for the dashboard overview cards.
// Uses a single multi-query fetch to minimise round-trips.

const pool = require('../config/db');

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  const [[activeDisasters]] = await pool.query(
    "SELECT COUNT(*) AS count FROM disasters WHERE status = 'active'"
  );

  const [[totalAffected]] = await pool.query(
    `SELECT COALESCE(SUM(az.population_affected), 0) AS total
     FROM affected_zones az
     JOIN disasters d ON d.id = az.disaster_id
     WHERE d.status = 'active'`
  );

  const [[volunteersDeployed]] = await pool.query(
    "SELECT COUNT(*) AS count FROM volunteers WHERE status IN ('dispatched','on-site')"
  );

  const [[pendingRequests]] = await pool.query(
    "SELECT COUNT(*) AS count FROM supply_requests WHERE status IN ('pending','partial')"
  );

  const [[criticalZones]] = await pool.query(
    `SELECT COUNT(*) AS count FROM affected_zones az
     JOIN disasters d ON d.id = az.disaster_id
     WHERE az.severity = 'critical' AND d.status = 'active'`
  );

  // Recent activity feed from audit_log
  const [recentActivity] = await pool.query(
    `SELECT al.*, u.name AS user_name
     FROM audit_log al LEFT JOIN users u ON u.id = al.user_id
     ORDER BY al.created_at DESC LIMIT 10`
  );

  res.json({
    activeDisasters:    activeDisasters.count,
    totalAffected:      totalAffected.total,
    volunteersDeployed: volunteersDeployed.count,
    pendingRequests:    pendingRequests.count,
    criticalZones:      criticalZones.count,
    recentActivity
  });
};

module.exports = { getStats };
