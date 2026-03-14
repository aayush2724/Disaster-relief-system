// routes/supply.js
const router = require('express').Router();
const { protect, authorise } = require('../middleware/auth');
const {
  getWarehouses, getInventory, getResources, addStock,
  getSupplyRequests, createSupplyRequest, transferSupplies, getTransferHistory
} = require('../controllers/supplyController');

router.get('/warehouses',             protect, getWarehouses);
router.get('/inventory/:warehouseId', protect, getInventory);
router.get('/resources',              protect, getResources);
router.post('/inventory/add',         protect, authorise('admin','agency'), addStock);
router.get('/requests',               protect, getSupplyRequests);
router.post('/requests',              protect, createSupplyRequest);
router.post('/transfers',             protect, authorise('admin','agency'), transferSupplies);
router.get('/transfers',              protect, getTransferHistory);

module.exports = router;
