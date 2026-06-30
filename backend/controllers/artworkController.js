const db = require('../config/db');

const getArtworks = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT a.*, u.name as artist_name 
      FROM artworks a 
      JOIN users u ON a.artist_id = u.id 
      WHERE a.status = 'available'
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getAuctionArtworks = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT a.*, u.name as artist_name, 
             COALESCE((SELECT MAX(bid_amount) FROM bids b WHERE b.artwork_id = a.id), a.price) as current_bid
      FROM artworks a 
      JOIN users u ON a.artist_id = u.id 
      WHERE a.status = 'auction'
      ORDER BY a.created_at DESC
    `);
    
    // Auto-resolve expired auctions
    const now = new Date();
    const activeAuctions = [];

    for (let art of result.rows) {
      if (art.auction_ends_at && new Date(art.auction_ends_at) <= now) {
        // Resolve it!
        try {
          await db.query('BEGIN');
          // Get highest bid
          const bidRes = await db.query('SELECT bidder_id, bid_amount FROM bids WHERE artwork_id = $1 ORDER BY bid_amount DESC LIMIT 1', [art.id]);
          if (bidRes.rows.length > 0) {
            const topBid = bidRes.rows[0];
            await db.query("INSERT INTO purchases (customer_id, artwork_id, amount, status) VALUES ($1, $2, $3, 'approved')", [topBid.bidder_id, art.id, topBid.bid_amount]);
            await db.query("UPDATE artworks SET status = 'sold', sold_at = NOW() WHERE id = $1", [art.id]);
          } else {
            // No bids, revert to available
            await db.query("UPDATE artworks SET status = 'available' WHERE id = $1", [art.id]);
          }
          await db.query('COMMIT');
        } catch (e) {
          await db.query('ROLLBACK');
          console.error("Failed to auto-resolve auction", e);
        }
      } else {
        activeAuctions.push(art);
      }
    }

    res.json(activeAuctions);
  } catch (error) {
    next(error);
  }
};

const getArtworkById = async (req, res, next) => {
  try {
    const result = await db.query('SELECT a.*, u.name as artist_name FROM artworks a JOIN users u ON a.artist_id = u.id WHERE a.id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404);
      return next(new Error('Artwork not found'));
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const createArtwork = async (req, res, next) => {
  try {
    const { title, description, price } = req.body;
    let image_url = req.body.image_url; // fallback if any
    if (req.file) {
      image_url = '/uploads/' + req.file.filename;
    }
    const artist_id = req.user.id;

    const result = await db.query(
      'INSERT INTO artworks (artist_id, title, description, price, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [artist_id, title, description, price, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = { getArtworks, getAuctionArtworks, getArtworkById, createArtwork };
