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

module.exports = { getAllUsers, toggleBanUser, moveArtworkToAuction };
