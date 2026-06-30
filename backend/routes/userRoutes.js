const express = require('express');
const router = express.Router();
const { getArtists, getArtistProfile, getCollectorProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/artists', getArtists);
router.get('/artists/:id', getArtistProfile);
router.get('/profile', protect, getCollectorProfile);
router.put('/profile', protect, upload.single('image'), updateProfile);

module.exports = router;
