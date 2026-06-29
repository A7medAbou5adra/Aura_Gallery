const db = require('../config/db');

const purchaseArtwork = async (req, res, next) => {
  try {
    const { artwork_id } = req.body;
    const customer_id = req.user.id;

    await db.query('BEGIN');
    const artworkRes = await db.query('SELECT * FROM artworks WHERE id = $1 FOR UPDATE', [artwork_id]);
    const artwork = artworkRes.rows[0];

    if (!artwork || artwork.status !== 'available') throw new Error('Artwork unavailable');

    const purchaseRes = await db.query(
      'INSERT INTO purchases (customer_id, artwork_id, amount) VALUES ($1, $2, $3) RETURNING *',
      [customer_id, artwork_id, artwork.price]
    );

    await db.query('COMMIT');
    res.status(201).json(purchaseRes.rows[0]);
  } catch (error) {
    await db.query('ROLLBACK');
    next(error);
  }
};

const createCustomOrder = async (req, res, next) => {
  try {
    const { artist_id, description, agreed_price } = req.body;
    const customer_id = req.user.id;

    const result = await db.query(
      'INSERT INTO custom_orders (customer_id, artist_id, description, agreed_price) VALUES ($1, $2, $3, $4) RETURNING *',
      [customer_id, artist_id, description, agreed_price]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const getCustomerOrders = async (req, res, next) => {
  try {
    const customer_id = req.user.id;
    const ordersRes = await db.query(`
      SELECT o.*, u.name as artist_name 
      FROM custom_orders o 
      JOIN users u ON o.artist_id = u.id 
      WHERE o.customer_id = $1
      ORDER BY o.created_at DESC
    `, [customer_id]);
    
    const purchasesRes = await db.query(`
      SELECT p.*, a.title, a.image_url, u.name as artist_name
      FROM purchases p
      JOIN artworks a ON p.artwork_id = a.id
      JOIN users u ON a.artist_id = u.id
      WHERE p.customer_id = $1
      ORDER BY p.purchased_at DESC
    `, [customer_id]);

    res.json({
      custom_orders: ordersRes.rows,
      purchases: purchasesRes.rows
    });
  } catch (error) {
    next(error);
  }
};

const getArtistOrders = async (req, res, next) => {
  try {
    const artist_id = req.user.id;
    const result = await db.query(`
      SELECT o.*, u.name as customer_name 
      FROM custom_orders o 
      JOIN users u ON o.customer_id = u.id 
      WHERE o.artist_id = $1
      ORDER BY o.created_at DESC
    `, [artist_id]);
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

module.exports = { purchaseArtwork, createCustomOrder, getCustomerOrders, getArtistOrders };
