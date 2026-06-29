const db = require('../config/db');

const getArtists = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.name, u.bio, u.custom_order_price, u.profile_image_url,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as review_count
      FROM users u
      LEFT JOIN reviews r ON u.id = r.artist_id
      WHERE u.role = 'artist' AND u.is_banned = false
      GROUP BY u.id
      ORDER BY average_rating DESC, review_count DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getArtistProfile = async (req, res, next) => {
  try {
    const artistId = req.params.id;
    const artistRes = await db.query('SELECT id, name, bio, custom_order_price, profile_image_url FROM users WHERE id = $1 AND role = $2', [artistId, 'artist']);
    
    if (artistRes.rows.length === 0) {
      res.status(404);
      return next(new Error('Artist not found'));
    }

    const availableArtworks = await db.query('SELECT * FROM artworks WHERE artist_id = $1 AND status = $2', [artistId, 'available']);
    const soldArtworks = await db.query('SELECT * FROM artworks WHERE artist_id = $1 AND status = $2', [artistId, 'sold']);

    res.json({
      profile: artistRes.rows[0],
      availableArtworks: availableArtworks.rows,
      soldArtworks: soldArtworks.rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getArtists, getArtistProfile };
