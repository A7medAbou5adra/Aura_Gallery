-- PostgreSQL Schema for Aura Gallery

-- 1. Create Enums for strict state management
CREATE TYPE user_role AS ENUM ('customer', 'artist', 'admin');
CREATE TYPE artwork_status AS ENUM ('available', 'sold', 'auction');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'completed', 'declined');

-- 2. Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'customer',
    
    -- Artist specific fields
    bio TEXT,
    custom_order_price NUMERIC(10, 2),
    average_rating NUMERIC(3, 2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Artworks Table
CREATE TABLE artworks (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT NOT NULL,
    status artwork_status DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sold_at TIMESTAMP WITH TIME ZONE
);

-- 4. Create Purchases Table (Records 1-of-1 acquisitions)
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    artwork_id INTEGER REFERENCES artworks(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Custom Orders Table (For commissions)
CREATE TABLE custom_orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    agreed_price NUMERIC(10, 2) NOT NULL,
    status order_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
