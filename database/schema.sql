-- ============================================================
--  E-Commerce Order Management System
--  schema.sql — MySQL

CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- ============================================================
-- 1. CATEGORIES
-- ============================================================
CREATE TABLE categories (
    category_id   INT           AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL UNIQUE
);


-- ============================================================
-- 2. USERS
-- ============================================================
CREATE TABLE users (
    user_id       INT           AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          ENUM('customer', 'admin') DEFAULT 'customer',
    created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- Index: login queries always filter by email
CREATE INDEX idx_users_email ON users(email);


-- ============================================================
-- 3. PRODUCTS
-- ============================================================
CREATE TABLE products (
    product_id    INT             AUTO_INCREMENT PRIMARY KEY,
    category_id   INT             NOT NULL,
    name          VARCHAR(200)    NOT NULL,
    price         DECIMAL(10, 2)  NOT NULL CHECK (price >= 0),
    stock_qty     INT             DEFAULT 0 CHECK (stock_qty >= 0),

    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Index: product listing pages filter by category
CREATE INDEX idx_products_category ON products(category_id);
-- Index: search by product name
CREATE INDEX idx_products_name ON products(name);


-- ============================================================
-- 4. ADDRESSES
-- ============================================================
CREATE TABLE addresses (
    address_id    INT           AUTO_INCREMENT PRIMARY KEY,
    user_id       INT           NOT NULL,
    street        VARCHAR(255)  NOT NULL,
    city          VARCHAR(100)  NOT NULL,
    pincode       VARCHAR(10)   NOT NULL,

    CONSTRAINT fk_address_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Index: fetch all addresses for a user
CREATE INDEX idx_addresses_user ON addresses(user_id);


-- ============================================================
-- 5. CART
-- ============================================================
CREATE TABLE cart (
    cart_id       INT   AUTO_INCREMENT PRIMARY KEY,
    user_id       INT   NOT NULL,
    product_id    INT   NOT NULL,
    quantity      INT   NOT NULL DEFAULT 1 CHECK (quantity > 0),
    added_at      DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- A user can only have one cart row per product
    CONSTRAINT uq_cart_user_product UNIQUE (user_id, product_id),

    CONSTRAINT fk_cart_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_cart_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Index: fetch cart for a specific user
CREATE INDEX idx_cart_user ON cart(user_id);


-- ============================================================
-- 6. COUPONS
-- ============================================================
CREATE TABLE coupons (
    coupon_id         INT             AUTO_INCREMENT PRIMARY KEY,
    code              VARCHAR(50)     NOT NULL UNIQUE,
    discount_percent  DECIMAL(5, 2)   NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    min_order_value   DECIMAL(10, 2)  DEFAULT 0,
    expiry_date       DATE            NOT NULL,
    is_active         BOOLEAN         DEFAULT TRUE
);

-- Index: coupon lookup is always by code
CREATE INDEX idx_coupons_code ON coupons(code);


-- ============================================================
-- 7. ORDERS
-- ============================================================
CREATE TABLE orders (
    order_id        INT             AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    address_id      INT             NOT NULL,
    coupon_id       INT             DEFAULT NULL,   -- nullable: coupon is optional
    total_amount    DECIMAL(10, 2)  NOT NULL CHECK (total_amount >= 0),
    discount_amount DECIMAL(10, 2)  DEFAULT 0,
    status          ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')
                    DEFAULT 'pending',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_order_address
        FOREIGN KEY (address_id)
        REFERENCES addresses(address_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_order_coupon
        FOREIGN KEY (coupon_id)
        REFERENCES coupons(coupon_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- Index: order history queries filter by user
CREATE INDEX idx_orders_user ON orders(user_id);
-- Index: admin dashboard filters by status
CREATE INDEX idx_orders_status ON orders(status);
-- Index: date-range reports
CREATE INDEX idx_orders_created_at ON orders(created_at);


-- ============================================================
-- 8. ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
    item_id       INT             AUTO_INCREMENT PRIMARY KEY,
    order_id      INT             NOT NULL,
    product_id    INT             NOT NULL,
    quantity      INT             NOT NULL CHECK (quantity > 0),
    unit_price    DECIMAL(10, 2)  NOT NULL,  -- snapshot of price at time of order

    CONSTRAINT fk_item_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_item_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Index: fetch all items in an order
CREATE INDEX idx_order_items_order ON order_items(order_id);
-- Index: find all orders containing a product (analytics)
CREATE INDEX idx_order_items_product ON order_items(product_id);


-- ============================================================
-- 9. PAYMENTS
-- ============================================================
CREATE TABLE payments (
    payment_id    INT     AUTO_INCREMENT PRIMARY KEY,
    order_id      INT     NOT NULL UNIQUE,   -- one-to-one with orders
    method        ENUM('upi', 'card', 'netbanking', 'cod') NOT NULL,
    status        ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    paid_at       DATETIME DEFAULT NULL,

    CONSTRAINT fk_payment_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ============================================================
-- 10. REVIEWS
-- ============================================================
CREATE TABLE reviews (
    review_id     INT       AUTO_INCREMENT PRIMARY KEY,
    user_id       INT       NOT NULL,
    product_id    INT       NOT NULL,
    rating        TINYINT   NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment       TEXT,
    created_at    DATETIME  DEFAULT CURRENT_TIMESTAMP,

    -- A user can only leave one review per product
    CONSTRAINT uq_review_user_product UNIQUE (user_id, product_id),

    CONSTRAINT fk_review_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_review_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Index: fetch all reviews for a product
CREATE INDEX idx_reviews_product ON reviews(product_id);


-- ============================================================
-- 11. ORDER STATUS LOG
-- ============================================================
CREATE TABLE order_status_log (
    log_id        INT       AUTO_INCREMENT PRIMARY KEY,
    order_id      INT       NOT NULL,
    status        ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') NOT NULL,
    changed_at    DATETIME  DEFAULT CURRENT_TIMESTAMP,
    note          VARCHAR(255),

    CONSTRAINT fk_log_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Index: fetch full status history of an order
CREATE INDEX idx_status_log_order ON order_status_log(order_id);


-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger 1: auto-deduct stock when an order item is inserted
DELIMITER $$
CREATE TRIGGER trg_deduct_stock
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE products
    SET stock_qty = stock_qty - NEW.quantity
    WHERE product_id = NEW.product_id;
END$$
DELIMITER ;


-- Trigger 2: auto-restore stock if an order is cancelled
DELIMITER $$
CREATE TRIGGER trg_restore_stock
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        UPDATE products p
        JOIN order_items oi ON p.product_id = oi.product_id
        SET p.stock_qty = p.stock_qty + oi.quantity
        WHERE oi.order_id = NEW.order_id;
    END IF;
END$$
DELIMITER ;


-- Trigger 3: auto-log every order status change into order_status_log
DELIMITER $$
CREATE TRIGGER trg_log_status_change
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO order_status_log (order_id, status, changed_at)
        VALUES (NEW.order_id, NEW.status, NOW());
    END IF;
END$$
DELIMITER ;


-- Trigger 4: auto-insert initial 'pending' log when a new order is created
DELIMITER $$
CREATE TRIGGER trg_log_new_order
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    INSERT INTO order_status_log (order_id, status, changed_at, note)
    VALUES (NEW.order_id, 'pending', NOW(), 'Order placed');
END$$
DELIMITER ;
