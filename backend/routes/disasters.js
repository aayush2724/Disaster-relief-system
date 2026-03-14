// routes/disasters.js
const router = require('express').Router();
const { protect, authorise } = require('../middleware/auth');
const {
  getAllDisasters, getSummary, getDisasterById,
  createDisaster, updateStatus, getZones, getAnnouncements
} = require('../controllers/disasterController');

router.get('/',           protect, getAllDisasters);
router.get('/summary',    protect, getSummary);
router.get('/:id',        protect, getDisasterById);
router.post('/',          protect, authorise('admin','agency'), createDisaster);
router.patch('/:id/status', protect, authorise('admin','agency'), updateStatus);
router.get('/:id/zones',  protect, getZones);
router.get('/:id/announcements', protect, getAnnouncements);

module.exports = router;
