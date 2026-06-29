const express = require('express');
const router = express.Router();
const { getAllUsers, toggleBanUser, moveArtworkToAuction, createArtist, getPendingPurchases, approvePurchase, rejectPurchase, updateArtworkStatus } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// All routes require admin
router.use(protect, requireRole('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/ban', toggleBanUser);
router.put('/artworks/:id/auction', moveArtworkToAuction);
router.post('/artists', createArtist);
router.get('/purchases/pending', getPendingPurchases);
router.put('/purchases/:id/approve', approvePurchase);
router.put('/purchases/:id/reject', rejectPurchase);
router.put('/artworks/:id/status', updateArtworkStatus);

module.exports = router;
