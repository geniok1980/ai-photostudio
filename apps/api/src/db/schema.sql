-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  name TEXT,
  role TEXT DEFAULT 'user',
  free_attempts_used INTEGER DEFAULT 0,
  balance_generations INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  category TEXT,
  preview_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Packages (tariffs)
CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  generations_count INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT 1
);

-- Generations
CREATE TABLE IF NOT EXISTS generations (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  location_id TEXT REFERENCES locations(id),
  original_photo_url TEXT NOT NULL,
  result_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'processing',
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  package_id TEXT REFERENCES packages(id),
  wata_transaction_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'RUB',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP
);
