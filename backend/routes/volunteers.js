// routes/volunteers.js
const router = require('express').Router();
const { protect, authorise } = require('../middleware/auth');
const {
  getAllVolunteers, getAvailableVolunteers, dispatchVolunteer,
  returnVolunteer, createProfile, getDispatchLogs
} = require('../controllers/volunteerController');

router.get('/',           protect, getAllVolunteers);
router.get('/available',  protect, getAvailableVolunteers);
router.post('/profile',   protect, createProfile);
router.post('/dispatch',  protect, authorise('admin','agency','ngo'), dispatchVolunteer);
router.post('/return/:volunteerId', protect, authorise('admin','agency','ngo'), returnVolunteer);
router.get('/:id/logs',   protect, getDispatchLogs);

module.exports = router;
