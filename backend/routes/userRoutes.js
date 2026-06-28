const express = require('express');
const router = express.Router();
const { getArtists, getArtistProfile } = require('../controllers/userController');

router.get('/artists', getArtists);
router.get('/artists/:id', getArtistProfile);

module.exports = router;
