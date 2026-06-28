const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
};

if (process.env.NODE_ENV === 'production') {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('Connected to PostgreSQL Database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // CRITICAL: process.exit() is omitted here to prevent Railway crash loops
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
