const bcrypt = require('bcrypt');
const db = require('./config/db');

async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seed...');

    // 1. Clear existing data safely
    await db.query('TRUNCATE TABLE custom_orders, purchases, artworks, users RESTART IDENTITY CASCADE');
    console.log('🧹 Cleaned existing tables.');

    // 2. Hash default passwords
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);
    const adminPassword = await bcrypt.hash('adminpassword123', salt);

    // 3. Create Users (Admin, Artists, Customers)
    const admin = await db.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'admin') RETURNING id`,
      ['Master Admin', 'admin@auragallery.com', adminPassword]
    );

    const artist1 = await db.query(
      `INSERT INTO users (name, email, password, role, bio, custom_order_price, average_rating, review_count) 
       VALUES ($1, $2, $3, 'artist', $4, $5, $6, $7) RETURNING id`,
      ['Julian Vance', 'julian@auragallery.com', defaultPassword, 'Master of monochromatic tension and shadow.', 5000.00, 4.9, 120]
    );
    const artist2 = await db.query(
      `INSERT INTO users (name, email, password, role, bio, custom_order_price, average_rating, review_count) 
       VALUES ($1, $2, $3, 'artist', $4, $5, $6, $7) RETURNING id`,
      ['Elena Rostova', 'elena@auragallery.com', defaultPassword, 'Sculpting with gold leaf and oil on grand canvases.', 8500.00, 4.8, 85]
    );
    const artist3 = await db.query(
      `INSERT INTO users (name, email, password, role, bio, custom_order_price, average_rating, review_count) 
       VALUES ($1, $2, $3, 'artist', $4, $5, $6, $7) RETURNING id`,
      ['Marcus Chen', 'marcus@auragallery.com', defaultPassword, 'Minimalist geometry representing the chaos of the modern world.', 4200.00, 4.7, 56]
    );

    const customer1 = await db.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'customer') RETURNING id`,
      ['Isabella Cross', 'isabella@auragallery.com', defaultPassword]
    );
    const customer2 = await db.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'customer') RETURNING id`,
      ['Arthur Pendelton', 'arthur@auragallery.com', defaultPassword]
    );

    console.log('👤 Created Users (1 Admin, 3 Artists, 2 Customers).');

    // 4. Create Artworks
    const artData = [
      [artist1.rows[0].id, 'The Obsidian Dream', 'A terrifyingly beautiful exploration of black.', 12500.00, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', 'available'],
      [artist1.rows[0].id, 'Fractured Light', 'Light escaping through dense geometric prisms.', 9800.00, 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2787&auto=format&fit=crop', 'sold'],
      [artist1.rows[0].id, 'Ethereal Descent', 'Falling through layers of atmospheric paint.', 15000.00, 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2787&auto=format&fit=crop', 'auction'],
      [artist2.rows[0].id, 'Golden Hour Silence', 'Thick gold leaf on oil, reflecting pure twilight.', 22000.00, 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2940&auto=format&fit=crop', 'sold'],
      [artist2.rows[0].id, 'Velvet Midnight', 'Deep indigo textures that swallow the ambient light.', 18500.00, 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop', 'available'],
      [artist2.rows[0].id, 'Whispers of Marble', 'Fluid strokes mimicking ancient roman stone.', 26000.00, 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=2938&auto=format&fit=crop', 'auction'],
      [artist3.rows[0].id, 'Crimson Geometry', 'Harsh angles clashing in vibrant reds.', 7400.00, 'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2787&auto=format&fit=crop', 'available'],
      [artist3.rows[0].id, 'Echoes of the Abyss', 'A minimalist circle that draws you endlessly inward.', 11200.00, 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=2787&auto=format&fit=crop', 'available'],
    ];

    const artworkIds = [];
    for (const art of artData) {
      const res = await db.query(
        `INSERT INTO artworks (artist_id, title, description, price, image_url, status) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        art
      );
      artworkIds.push(res.rows[0].id);
    }
    
    // Set sold dates for the sold items
    await db.query(`UPDATE artworks SET sold_at = NOW() WHERE status = 'sold'`);

    console.log('🎨 Created 8 Premium 1-of-1 Artworks.');

    // 5. Create Purchases
    await db.query(
      `INSERT INTO purchases (customer_id, artwork_id, amount) VALUES ($1, $2, $3)`,
      [customer1.rows[0].id, artworkIds[1], 9800.00] // Isabella bought Fractured Light
    );
    await db.query(
      `INSERT INTO purchases (customer_id, artwork_id, amount) VALUES ($1, $2, $3)`,
      [customer2.rows[0].id, artworkIds[3], 22000.00] // Arthur bought Golden Hour Silence
    );
    console.log('🛍️ Created Mock Purchases.');

    // 6. Create Custom Orders
    await db.query(
      `INSERT INTO custom_orders (customer_id, artist_id, description, agreed_price, status) 
       VALUES ($1, $2, $3, $4, 'pending')`,
      [customer1.rows[0].id, artist1.rows[0].id, 'I need a monochromatic piece for my new brutalist office.', 5000.00]
    );
    await db.query(
      `INSERT INTO custom_orders (customer_id, artist_id, description, agreed_price, status) 
       VALUES ($1, $2, $3, $4, 'accepted')`,
      [customer2.rows[0].id, artist2.rows[0].id, 'A large portrait using exclusively gold leaf.', 8500.00]
    );
    console.log('📝 Created Mock Custom Orders.');

    console.log('✅ Seeding Complete! The gallery is ready.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
