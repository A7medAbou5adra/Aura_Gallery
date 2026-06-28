const express = require('express');
const router = express.Router();
const { placeBid } = require('../controllers/auctionController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.post('/bid', protect, requireRole('customer'), placeBid);

module.exports = router;
