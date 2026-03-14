// controllers/supplyController.js
// Manages the entire supply chain: warehouses, inventory, requests, and transfers.
// Transfers use the transfer_supplies() stored procedure to ensure atomicity —
// stock can never go negative because the SP checks availability before committing.

const pool = require('../config/db');

// ── WAREHOUSES ──────────────────────────────────────────────

// GET /api/warehouses
const getWarehouses = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT w.*, u.name AS managed_by_name FROM warehouses w
     LEFT JOIN users u ON u.id = w.managed_by`
  );
  res.json(rows);
};

// GET /api/inventory/:warehouseId — stock levels for a warehouse
const getInventory = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT i.*, r.name AS resource_name, r.category, r.unit
     FROM inventory i
     JOIN resources r ON r.id = i.resource_id
     WHERE i.warehouse_id = ?
     ORDER BY r.category, r.name`,
    [req.params.warehouseId]
  );
  res.json(rows);
};

// GET /api/resources — master resource list
const getResources = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM resources ORDER BY category, name');
  res.json(rows);
};

// POST /api/inventory/add — add stock to a warehouse (admin only)
const addStock = async (req, res) => {
  const { warehouse_id, resource_id, quantity } = req.body;

  await pool.query(
    `INSERT INTO inventory (warehouse_id, resource_id, quantity)
     VALUES (?,?,?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [warehouse_id, resource_id, quantity]
  );

  await pool.query(
    'INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?,?,?,?,?)',
    [req.user.id, 'STOCK_ADDED', 'inventory', warehouse_id, `Resource ${resource_id}: +${quantity}`]
  );

  res.json({ message: 'Stock updated' });
};

// ── SUPPLY REQUESTS ─────────────────────────────────────────

// GET /api/supply-requests — all requests, optional ?status= filter
const getSupplyRequests = async (req, res) => {
  const { status } = req.query;
  let q = `SELECT sr.*, az.zone_name, r.name AS resource_name, r.unit, d.title AS disaster_title
           FROM supply_requests sr
           JOIN affected_zones az ON az.id = sr.zone_id
           JOIN disasters d ON d.id = az.disaster_id
           JOIN resources r ON r.id = sr.resource_id`;
  const params = [];
  if (status) { q += ' WHERE sr.status = ?'; params.push(status); }
  q += ' ORDER BY sr.requested_at DESC';

  const [rows] = await pool.query(q, params);
  res.json(rows);
};

// POST /api/supply-requests — zone creates a resource request
const createSupplyRequest = async (req, res) => {
  const { zone_id, resource_id, warehouse_id, quantity_requested } = req.body;

  if (!zone_id || !resource_id || !quantity_requested) {
    return res.status(400).json({ message: 'zone_id, resource_id, quantity_requested required' });
  }

  const [result] = await pool.query(
    `INSERT INTO supply_requests (zone_id, resource_id, warehouse_id, quantity_requested, requested_by)
     VALUES (?,?,?,?,?)`,
    [zone_id, resource_id, warehouse_id || null, quantity_requested, req.user.id]
  );

  res.status(201).json({ id: result.insertId, message: 'Supply request created' });
};

// ── SUPPLY TRANSFERS ────────────────────────────────────────

// POST /api/supply-transfers — calls the transfer_supplies stored procedure
// This is the most important endpoint: it's atomic and prevents negative stock.
const transferSupplies = async (req, res) => {
  const { warehouse_id, zone_id, resource_id, quantity, request_id } = req.body;

  if (!warehouse_id || !zone_id || !resource_id || !quantity) {
    return res.status(400).json({ message: 'warehouse_id, zone_id, resource_id, quantity required' });
  }

  try {
    // CALL SP — rolls back automatically if stock insufficient
    await pool.query('CALL transfer_supplies(?,?,?,?,?,?)', [
      warehouse_id, zone_id, resource_id, quantity, request_id || null, req.user.id
    ]);

    await pool.query(
      'INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?,?,?,?,?)',
      [req.user.id, 'SUPPLY_TRANSFER', 'supply_transfers', warehouse_id,
       `Res ${resource_id}: ${quantity} units → Zone ${zone_id}`]
    );

    res.json({ message: 'Transfer completed successfully' });
  } catch (err) {
    // The SP signals an error if stock is insufficient — we surface it cleanly
    if (err.sqlState === '45000') {
      return res.status(409).json({ message: err.message });
    }
    throw err;
  }
};

// GET /api/supply-transfers — recent transfer history
const getTransferHistory = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT st.*, w.name AS warehouse_name, az.zone_name, r.name AS resource_name, r.unit, u.name AS authorized_by_name
     FROM supply_transfers st
     JOIN warehouses w ON w.id = st.warehouse_id
     JOIN affected_zones az ON az.id = st.zone_id
     JOIN resources r ON r.id = st.resource_id
     LEFT JOIN users u ON u.id = st.authorized_by
     ORDER BY st.transferred_at DESC
     LIMIT 100`
  );
  res.json(rows);
};

module.exports = { getWarehouses, getInventory, getResources, addStock, getSupplyRequests, createSupplyRequest, transferSupplies, getTransferHistory };
