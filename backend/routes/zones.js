// routes/zones.js
const router = require('express').Router();
const { protect, authorise } = require('../middleware/auth');
const { createZone, getZoneById, getZoneReports, submitZoneReport } = require('../controllers/zoneController');

router.post('/',              protect, authorise('admin','agency','ngo'), createZone);
router.get('/:id',            protect, getZoneById);
router.get('/:id/reports',    protect, getZoneReports);
router.post('/reports',       protect, submitZoneReport);

module.exports = router;
