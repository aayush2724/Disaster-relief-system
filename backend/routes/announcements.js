// routes/announcements.js
const router = require('express').Router();
const { protect, authorise } = require('../middleware/auth');
const { createAnnouncement, getAllAnnouncements } = require('../controllers/announcementController');

router.get('/',  protect, getAllAnnouncements);
router.post('/', protect, authorise('admin','agency','ngo'), createAnnouncement);

module.exports = router;
