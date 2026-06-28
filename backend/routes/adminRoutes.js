const express = require('express');
const router = express.Router();
const { getAllUsers, toggleBanUser, moveArtworkToAuction } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// All routes require admin
router.use(protect, requireRole('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/ban', toggleBanUser);
router.put('/artworks/:id/auction', moveArtworkToAuction);

module.exports = router;
