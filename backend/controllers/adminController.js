const db = require('../config/db');

const getAllUsers = async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, name, email, role, is_banned, created_at FROM users');
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
    const result = await db.query("UPDATE artworks SET status = 'auction' WHERE id = $1 RETURNING *", [id]);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const createArtist = async (req, res, next) => {
  try {
    const { name, email, password, bio, custom_order_price, profile_image_url } = req.body;
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
    const result = await db.query("UPDATE artworks SET status = $1 WHERE id = $2 RETURNING *", [status, id]);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, toggleBanUser, moveArtworkToAuction, createArtist, getPendingPurchases, approvePurchase, rejectPurchase, updateArtworkStatus };
