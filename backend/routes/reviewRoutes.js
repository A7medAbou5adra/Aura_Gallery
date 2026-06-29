const express = require('express');
const router = express.Router();
const { createReview, getArtistReviews } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createReview);
router.get('/artist/:id', getArtistReviews);

module.exports = router;
