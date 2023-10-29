CREATE DATABASE nodeshop
  WITH
  OWNER = drizzy
  ENCODING = 'UTF8'
  TEMPLATE template0
;

CREATE TYPE order_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'succeeded',  'SHIPPED', 'DELIVERED');

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL,
  lastname VARCHAR(20),
  username VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(50) NOT NULL UNIQUE,
  phone VARCHAR(25),
  password VARCHAR(255) NOT NULL,
  role text[] NOT NULL DEFAULT '{"USER"}',
  activation_pin INTEGER NOT NULL,
  activated_at TIMESTAMP,
  is_active BOOLEAN DEFAULT false,
  is_pin_used BOOLEAN DEFAULT false,
  reset_token VARCHAR(255),
  reset_token_expire TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  update_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE address(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fullname VARCHAR(50) NOT NULL,
  phone VARCHAR(25) NOT NULL,
  country VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  update_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug TEXT NOT NULL,
  description VARCHAR(1000) NOT NULL,
  stock INTEGER NOT NULL,
  price FLOAT NOT NULL,
  category text[] NOT NULL,
  brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  update_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products_image(
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  secure_url VARCHAR(255) NOT NULL,
  public_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address_id INTEGER NOT NULL REFERENCES address(id) ON DELETE CASCADE,
  total_price FLOAT NOT NULL,
  status order_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders_products (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  subtotal FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method VARCHAR(255) NOT NULL,
  payment_status VARCHAR(255) NOT NULL,
  amount FLOAT NOT NULL,
  amount_in_cents INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stripe_payments (
  id SERIAL PRIMARY KEY,
  payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  stripe_payment_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE paypal_payments (
  id SERIAL PRIMARY KEY,
  payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  paypal_payment_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
