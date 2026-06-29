const db = require('../config/db');

const createReview = async (req, res, next) => {
  try {
    const customer_id = req.user.id;
    const { artist_id, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400);
      return next(new Error('Rating must be between 1 and 5'));
    }
    if (!artist_id) {
      res.status(400);
      return next(new Error('Review must target an artist'));
    }

    const result = await db.query(
      'INSERT INTO reviews (customer_id, artist_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [customer_id, artist_id, rating, comment]
    );

    // If it's an artist review, update the artist's average rating in users table
    // Update the artist's average rating in users table
    await db.query(`
      UPDATE users 
      SET 
        average_rating = (SELECT AVG(rating) FROM reviews WHERE artist_id = $1),
        review_count = (SELECT COUNT(id) FROM reviews WHERE artist_id = $1)
      WHERE id = $1
    `, [artist_id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const getArtistReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT r.*, u.name as customer_name, u.profile_image_url as customer_image 
      FROM reviews r 
      JOIN users u ON r.customer_id = u.id 
      WHERE r.artist_id = $1 
      ORDER BY r.created_at DESC
    `, [id]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getArtistReviews };
