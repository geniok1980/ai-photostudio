-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  name TEXT,
  role TEXT DEFAULT 'user',
  free_attempts_used INTEGER DEFAULT 0,
  balance_generations INTEGER DEFAULT 0,
  spark_balance INTEGER DEFAULT 0,
  total_sparks_earned INTEGER DEFAULT 0,
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
  generations_count INTEGER DEFAULT 0,
  sparks_count INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT 1
);

-- Generation modes (portrait, product)
CREATE TABLE IF NOT EXISTS generation_modes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1
);

-- Product categories
CREATE TABLE IF NOT EXISTS product_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1
);

-- Concepts (catalog_shot, on_model, composition)
CREATE TABLE IF NOT EXISTS concepts (
  id TEXT PRIMARY KEY,
  mode_id TEXT REFERENCES generation_modes(id),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  prompt_template TEXT NOT NULL,
  preview_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1
);

-- Infographic templates
CREATE TABLE IF NOT EXISTS infographic_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  preview_url TEXT,
  config TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1
);

-- Generations
CREATE TABLE IF NOT EXISTS generations (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  location_id TEXT REFERENCES locations(id),
  mode_id TEXT REFERENCES generation_modes(id),
  concept_id TEXT REFERENCES concepts(id),
  category_id TEXT REFERENCES product_categories(id),
  product_description TEXT,
  original_photo_url TEXT NOT NULL,
  result_url TEXT,
  infographic_url TEXT,
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

-- Spark transactions
CREATE TABLE IF NOT EXISTS spark_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
