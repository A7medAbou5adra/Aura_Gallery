const express = require('express');
const router = express.Router();
const { getAllUsers, getAllArtworksAdmin, toggleBanUser, moveArtworkToAuction, createArtist, getPendingPurchases, approvePurchase, rejectPurchase, updateArtworkStatus, updateArtist, deleteArtist, forceCloseAuction } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// All routes require admin
router.use(protect, requireRole('admin'));

router.get('/users', getAllUsers);
router.get('/artworks', getAllArtworksAdmin);
router.put('/users/:id/ban', toggleBanUser);
router.put('/artworks/:id/auction', moveArtworkToAuction);
router.put('/auctions/:id/force-close', forceCloseAuction);
router.post('/artists', upload.single('image'), createArtist);
router.put('/artists/:id', upload.single('image'), updateArtist);
router.delete('/artists/:id', deleteArtist);
router.get('/purchases/pending', getPendingPurchases);
router.put('/purchases/:id/approve', approvePurchase);
router.put('/purchases/:id/reject', rejectPurchase);
router.put('/artworks/:id/status', updateArtworkStatus);

module.exports = router;
