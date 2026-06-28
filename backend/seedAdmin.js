const bcrypt = require('bcrypt');
const db = require('./config/db');

async function seedAdmin() {
  const adminEmail = 'admin@auragallery.com';
  const adminPassword = 'adminpassword123'; // The default password

  try {
    console.log('Seeding initial Admin account...');

    // 1. Check if an admin already exists
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    if (existing.rows.length > 0) {
      console.log('Admin account already exists!');
      process.exit(0);
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // 3. Insert the admin user into the database
    const query = `
      INSERT INTO users (name, email, password, role) 
      VALUES ($1, $2, $3, 'admin') 
      RETURNING id, name, email, role;
    `;
    const result = await db.query(query, ['Master Admin', adminEmail, hashedPassword]);

    console.log('✅ Admin account successfully created!');
    console.log('---');
    console.log('Login Email: ', result.rows[0].email);
    console.log('Login Password: ', adminPassword);
    console.log('---');
    console.log('You can now log in at /login as an Admin.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin account:', error);
    process.exit(1);
  }
}

seedAdmin();
