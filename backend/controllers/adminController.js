const db = require('../config/db');

const getAllUsers = async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, name, email, role, is_banned, created_at FROM users');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getAllArtworksAdmin = async (req, res, next) => {
  try {
    const result = await db.query('SELECT a.*, u.name as artist_name FROM artworks a JOIN users u ON a.artist_id = u.id ORDER BY a.created_at DESC');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const toggleBanUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRes = await db.query('SELECT is_banned FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const newStatus = !userRes.rows[0].is_banned;
    const result = await db.query('UPDATE users SET is_banned = $1 WHERE id = $2 RETURNING id, name, email, is_banned', [newStatus, id]);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const moveArtworkToAuction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { auction_ends_at, max_bid_limit } = req.body;
    const result = await db.query("UPDATE artworks SET status = 'auction', auction_ends_at = $1, max_bid_limit = $2 WHERE id = $3 RETURNING *", [auction_ends_at || null, max_bid_limit || null, id]);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const createArtist = async (req, res, next) => {
  try {
    const { name, email, password, bio, custom_order_price } = req.body;
    let profile_image_url = req.body.profile_image_url;
    if (req.file) {
      profile_image_url = '/uploads/' + req.file.filename;
    }
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (name, email, password, role, bio, custom_order_price, profile_image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'artist', bio, custom_order_price, profile_image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const getPendingPurchases = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT p.*, a.title, c.name as customer_name 
      FROM purchases p 
      JOIN artworks a ON p.artwork_id = a.id 
      JOIN users c ON p.customer_id = c.id 
      WHERE p.status = 'pending'
      ORDER BY p.purchased_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const approvePurchase = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('BEGIN');
    const purchaseRes = await db.query("UPDATE purchases SET status = 'approved' WHERE id = $1 RETURNING *", [id]);
    const purchase = purchaseRes.rows[0];
    if (purchase) {
      await db.query("UPDATE artworks SET status = 'sold', sold_at = NOW() WHERE id = $1", [purchase.artwork_id]);
    }
    await db.query('COMMIT');
    res.json(purchase);
  } catch (error) {
    await db.query('ROLLBACK');
    next(error);
  }
};

const rejectPurchase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query("UPDATE purchases SET status = 'rejected' WHERE id = $1 RETURNING *", [id]);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const updateArtworkStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    let query = "UPDATE artworks SET status = $1";
    if (status === 'available') {
      query += ", sold_at = NULL, auction_ends_at = NULL, max_bid_limit = NULL";
    }
    query += " WHERE id = $2 RETURNING *";
    
    const result = await db.query(query, [status, id]);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const updateArtist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, bio, custom_order_price } = req.body;
    let profile_image_url = req.body.profile_image_url;
    if (req.file) {
      profile_image_url = '/uploads/' + req.file.filename;
    }
    const result = await db.query(
      'UPDATE users SET name = $1, bio = $2, custom_order_price = $3, profile_image_url = COALESCE($4, profile_image_url) WHERE id = $5 AND role = $6 RETURNING id, name, bio, custom_order_price, profile_image_url',
      [name, bio, custom_order_price, profile_image_url, id, 'artist']
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const deleteArtist = async (req, res, next) => {
  try {
    const { id } = req.params;
    // We might need to delete or reassign their artworks, but for simplicity we'll just delete them.
    // PostgreSQL CASCADE will handle artworks if configured, or we can just delete. Let's execute delete.
    await db.query("DELETE FROM users WHERE id = $1 AND role = 'artist'", [id]);
    res.json({ message: 'Artist deleted' });
  } catch (error) {
    next(error);
  }
};

const forceCloseAuction = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await db.query('BEGIN');
    const bidRes = await db.query('SELECT bidder_id, bid_amount FROM bids WHERE artwork_id = $1 ORDER BY bid_amount DESC LIMIT 1', [id]);
    
    if (bidRes.rows.length > 0) {
      const topBid = bidRes.rows[0];
      await db.query("INSERT INTO purchases (customer_id, artwork_id, amount, status) VALUES ($1, $2, $3, 'approved')", [topBid.bidder_id, id, topBid.bid_amount]);
      await db.query("UPDATE artworks SET status = 'sold', sold_at = NOW(), auction_ends_at = NOW() WHERE id = $1", [id]);
    } else {
      await db.query("UPDATE artworks SET status = 'available', auction_ends_at = NULL WHERE id = $1", [id]);
    }
    await db.query('COMMIT');
    
    res.json({ message: 'Auction force closed successfully.' });
  } catch (error) {
    await db.query('ROLLBACK');
    next(error);
  }
};

module.exports = { getAllUsers, getAllArtworksAdmin, toggleBanUser, moveArtworkToAuction, createArtist, getPendingPurchases, approvePurchase, rejectPurchase, updateArtworkStatus, updateArtist, deleteArtist, forceCloseAuction };
