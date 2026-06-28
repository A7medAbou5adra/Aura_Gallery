const express = require('express');
const router = express.Router();
const { purchaseArtwork, createCustomOrder, getCustomerOrders, getArtistOrders } = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.post('/purchase', protect, requireRole('customer'), purchaseArtwork);
router.post('/custom', protect, requireRole('customer'), createCustomOrder);
router.get('/customer', protect, requireRole('customer'), getCustomerOrders);
router.get('/artist', protect, requireRole('artist'), getArtistOrders);

module.exports = router;
