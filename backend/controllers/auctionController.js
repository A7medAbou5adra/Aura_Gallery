const db = require('../config/db');

const placeBid = async (req, res, next) => {
  try {
    const { artwork_id, bid_amount } = req.body;
    const bidder_id = req.user.id;

    await db.query('BEGIN');
    
    // Check artwork status and time
    const artworkRes = await db.query('SELECT * FROM artworks WHERE id = $1 FOR UPDATE', [artwork_id]);
    const artwork = artworkRes.rows[0];

    if (!artwork || artwork.status !== 'auction') {
      throw new Error('Artwork is not actively in an auction.');
    }

    if (artwork.auction_ends_at && new Date() > new Date(artwork.auction_ends_at)) {
      throw new Error('This auction has already ended.');
    }

    // Check highest bid
    const maxBidRes = await db.query('SELECT MAX(bid_amount) as max_bid FROM bids WHERE artwork_id = $1', [artwork_id]);
    const currentHighest = parseFloat(maxBidRes.rows[0].max_bid) || parseFloat(artwork.price);

    if (parseFloat(bid_amount) <= currentHighest) {
      throw new Error(`Your bid must be higher than the current price of $${currentHighest}`);
    }

    if (artwork.max_bid_limit && parseFloat(bid_amount) > parseFloat(artwork.max_bid_limit)) {
      throw new Error(`Anti-Sabotage: Bid exceeds the maximum allowed limit of $${artwork.max_bid_limit}`);
    }

    // Place bid
    const result = await db.query(
      'INSERT INTO bids (artwork_id, bidder_id, bid_amount) VALUES ($1, $2, $3) RETURNING *',
      [artwork_id, bidder_id, bid_amount]
    );

    await db.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await db.query('ROLLBACK');
    next(error);
  }
};

module.exports = { placeBid };
