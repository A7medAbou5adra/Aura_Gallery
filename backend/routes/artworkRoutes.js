const express = require('express');
const router = express.Router();
const { getArtworks, getAuctionArtworks, getArtworkById, createArtwork } = require('../controllers/artworkController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', getArtworks);
router.get('/auctions', getAuctionArtworks); // New endpoint
router.get('/:id', getArtworkById);
router.post('/', protect, requireRole('artist'), upload.single('image'), createArtwork);

module.exports = router;
