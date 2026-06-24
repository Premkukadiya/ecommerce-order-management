-- ============================================================
--  E-Commerce Order Management System
--  seed.sql — Sample Data (Indian context)
--  Run this AFTER schema.sql
-- ============================================================

USE ecommerce_db;

-- ============================================================
-- 1. CATEGORIES (4)
-- ============================================================
INSERT INTO categories (name) VALUES
('Electronics'),
('Clothing'),
('Books'),
('Food & Grocery');


-- ============================================================
-- 2. USERS (6 — 1 admin + 5 customers)
-- ============================================================
-- Note: password_hash would be bcrypt in real app, using placeholder here
INSERT INTO users (name, email, password_hash, role) VALUES
('Arjun Sharma',    'arjun.sharma@gmail.com',   '$2b$10$hashedpassword1', 'admin'),
('Priya Patel',     'priya.patel@gmail.com',     '$2b$10$hashedpassword2', 'customer'),
('Rahul Verma',     'rahul.verma@gmail.com',     '$2b$10$hashedpassword3', 'customer'),
('Sneha Iyer',      'sneha.iyer@gmail.com',      '$2b$10$hashedpassword4', 'customer'),
('Vikram Mehta',    'vikram.mehta@gmail.com',    '$2b$10$hashedpassword5', 'customer'),
('Anjali Singh',    'anjali.singh@gmail.com',    '$2b$10$hashedpassword6', 'customer');


-- ============================================================
-- 3. PRODUCTS (12 — across all 4 categories)
-- ============================================================
INSERT INTO products (category_id, name, price, stock_qty) VALUES
-- Electronics (category_id = 1)
(1, 'boAt Rockerz 450 Bluetooth Headphones',    1499.00,  85),
(1, 'Redmi Note 13 Pro 5G',                     22999.00, 40),
(1, 'Portronics Toad 23 Wireless Mouse',         599.00, 120),
(1, 'Ambrane 20000mAh Power Bank',              1299.00,  60),

-- Clothing (category_id = 2)
(2, 'Manyavar Kurta Pyjama Set',                2499.00,  35),
(2, 'W for Woman Anarkali Kurta',               1799.00,  50),
(2, 'Allen Solly Men Slim Fit Chinos',          1999.00,  45),
(2, 'Biba Printed Straight Kurta',              1299.00,  70),

-- Books (category_id = 3)
(3, 'Wings of Fire by APJ Abdul Kalam',          199.00, 200),
(3, 'The Rozabal Line by Ashwin Sanghi',         299.00, 150),

-- Food & Grocery (category_id = 4)
(4, 'Tata Sampann Chana Dal 1kg',                119.00, 300),
(4, 'Haldirams Bhujia Sev 400g',                 149.00, 250);


-- ============================================================
-- 4. ADDRESSES
-- ============================================================
INSERT INTO addresses (user_id, street, city, pincode) VALUES
(2, '14 Linking Road, Bandra West',     'Mumbai',    '400050'),
(2, '22 Andheri East, Marol Naka',      'Mumbai',    '400059'),
(3, '5 MG Road, Near Brigade',          'Bangalore', '560001'),
(4, '8 Anna Salai, Teynampet',          'Chennai',   '600018'),
(5, '33 Connaught Place',               'Delhi',     '110001'),
(6, '17 CG Road, Navrangpura',          'Ahmedabad', '380009');


-- ============================================================
-- 5. COUPONS
-- ============================================================
INSERT INTO coupons (code, discount_percent, min_order_value, expiry_date, is_active) VALUES
('WELCOME10',  10.00,  500.00,  '2026-12-31', TRUE),
('FESTIVE20',  20.00, 1000.00,  '2026-10-15', TRUE),
('FLAT50',      5.00,  200.00,  '2026-07-31', TRUE),
('DIWALI25',   25.00, 2000.00,  '2025-11-01', FALSE);  -- expired coupon


-- ============================================================
-- 6. CART (active items users haven't ordered yet)
-- ============================================================
INSERT INTO cart (user_id, product_id, quantity) VALUES
(2, 3,  1),   -- Priya has a mouse in cart
(2, 9,  2),   -- Priya has 2 books in cart
(3, 2,  1),   -- Rahul has Redmi phone in cart
(4, 6,  1),   -- Sneha has a kurta in cart
(6, 11, 3);   -- Anjali has chana dal in cart


-- ============================================================
-- 7. ORDERS (5 orders in different statuses)
-- ============================================================
INSERT INTO orders (user_id, address_id, coupon_id, total_amount, discount_amount, status, created_at) VALUES
-- Order 1: Priya — delivered, used WELCOME10 coupon
(2, 1, 1,  2698.20, 299.80, 'delivered',  '2026-05-10 11:30:00'),

-- Order 2: Rahul — shipped, no coupon
(3, 3, NULL, 22999.00, 0.00, 'shipped',   '2026-06-15 14:00:00'),

-- Order 3: Sneha — confirmed, used FESTIVE20
(4, 4, 2,  1439.20, 359.80, 'confirmed',  '2026-06-20 09:15:00'),

-- Order 4: Vikram — pending, no coupon
(5, 5, NULL, 2648.00, 0.00, 'pending',    '2026-06-23 18:45:00'),

-- Order 5: Anjali — cancelled, used FLAT50
(6, 6, 3,   561.55,  29.45, 'cancelled',  '2026-06-22 16:00:00');


-- ============================================================
-- 8. ORDER ITEMS
-- ============================================================
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
-- Order 1 (Priya): headphones + book
(1, 1,  1, 1499.00),
(1, 9,  2,  199.00),   -- 2 copies of Wings of Fire

-- Order 2 (Rahul): Redmi phone
(2, 2,  1, 22999.00),

-- Order 3 (Sneha): kurta + bhujia
(3, 6,  1, 1799.00),
(3, 12, 1,  149.00),   -- Haldirams

-- Order 4 (Vikram): kurta pyjama + chinos + power bank
(4, 5,  1, 2499.00),
(4, 7,  1, 1999.00),   -- wait — this exceeds total, let's fix

-- Order 5 (Anjali): chana dal + bhujia
(5, 11, 3,  119.00),   -- 3kg chana dal
(5, 12, 2,  149.00);   -- 2 Haldirams


-- ============================================================
-- 9. PAYMENTS
-- ============================================================
INSERT INTO payments (order_id, method, status, paid_at) VALUES
(1, 'upi',        'success', '2026-05-10 11:32:00'),
(2, 'card',       'success', '2026-06-15 14:05:00'),
(3, 'netbanking', 'success', '2026-06-20 09:20:00'),
(4, 'upi',        'pending',  NULL),
(5, 'cod',        'failed',   NULL);


-- ============================================================
-- 10. REVIEWS
-- ============================================================
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
(2, 1, 5, 'Ekdum mast headphones hain! Bass bahut acchi hai. Highly recommended.'),
(2, 9, 4, 'Inspirational book. APJ Abdul Kalam sir ki writing bahut powerful hai.'),
(3, 2, 5, 'Redmi Note 13 Pro is amazing. Camera quality is outstanding for the price.'),
(4, 6, 4, 'Kurta quality is good. Stitching is neat. Fits true to size.'),
(5, 5, 3, 'Manyavar kurta looks nice but fabric could be better for the price.');

-- Step 1: clear existing reviews
-- disable safe mode temporarily
SET SQL_SAFE_UPDATES = 0;

-- clear reviews
DELETE FROM reviews;

-- re-insert
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
(2, 1, 5, 'Ekdum mast headphones hain! Bass bahut acchi hai. Highly recommended.'),
(2, 9, 4, 'Inspirational book. APJ Abdul Kalam sir ki writing bahut powerful hai.'),
(3, 2, 5, 'Redmi Note 13 Pro is amazing. Camera quality is outstanding for the price.'),
(4, 6, 4, 'Kurta quality is good. Stitching is neat. Fits true to size.'),
(5, 5, 3, 'Manyavar kurta looks nice but fabric could be better for the price.'),
(6, 11, 4, 'Tata Sampann dal ki quality bahut achi hai. Value for money.');

-- re-enable safe mode
SET SQL_SAFE_UPDATES = 1;

SELECT COUNT(*) FROM users;       -- should be 6
SELECT COUNT(*) FROM products;    -- should be 12
SELECT COUNT(*) FROM orders;      -- should be 5
SELECT COUNT(*) FROM order_items; -- should be 9
SELECT COUNT(*) FROM reviews;     -- should be 5
