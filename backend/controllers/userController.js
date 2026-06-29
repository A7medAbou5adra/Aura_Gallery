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

const getCollectorProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Evaluate Gamification dynamically before sending
    // Count custom orders
    const ordersRes = await db.query("SELECT COUNT(id) FROM custom_orders WHERE customer_id = $1 AND status = 'completed'", [userId]);
    const ordersCount = parseInt(ordersRes.rows[0].count, 10);
    
    // Count auction wins (purchases from artworks that were in auction? Actually we just count if there's a bid won. But wait, purchases where artwork had auction_ends_at is hard to track. We'll just count total purchases as 'Patron' and custom orders)
    // To make it simple based on the prompt: 
    // "Auction Conqueror": won a live auction (purchases where artwork status was auction... wait, once won, artwork status is sold. Let's just check if they have a purchase where they were the highest bidder in bids table)
    const auctionWinsRes = await db.query("SELECT COUNT(DISTINCT b.artwork_id) FROM bids b JOIN purchases p ON b.artwork_id = p.artwork_id WHERE p.customer_id = $1 AND b.bidder_id = $1", [userId]);
    const auctionWins = parseInt(auctionWinsRes.rows[0].count, 10);

    let badges = [];
    if (ordersCount >= 1) badges.push('Patron of the Arts');
    if (auctionWins >= 1) badges.push('Auction Conqueror');

    // Update their badges in DB
    await db.query("UPDATE users SET badges = $1 WHERE id = $2", [badges, userId]);

    // Fetch fresh profile
    const userRes = await db.query('SELECT id, name, email, role, profile_image_url, showcase_artworks, badges FROM users WHERE id = $1', [userId]);
    
    res.json(userRes.rows[0]);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { profile_image_url, showcase_artworks } = req.body;

    const result = await db.query(
      'UPDATE users SET profile_image_url = COALESCE($1, profile_image_url), showcase_artworks = COALESCE($2, showcase_artworks) WHERE id = $3 RETURNING id, name, profile_image_url, showcase_artworks, badges',
      [profile_image_url, showcase_artworks, userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = { getArtists, getArtistProfile, getCollectorProfile, updateProfile };
