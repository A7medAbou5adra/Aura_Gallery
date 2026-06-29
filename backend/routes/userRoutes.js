const express = require('express');
const router = express.Router();
const { getArtists, getArtistProfile, getCollectorProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/artists', getArtists);
router.get('/artists/:id', getArtistProfile);
router.get('/profile', protect, getCollectorProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
