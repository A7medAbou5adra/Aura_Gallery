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
    res.json(result.rows);
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
    const { title, description, price, image_url } = req.body;
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
