-- ============================================================
--  E-Commerce Order Management System
--  queries.sql — Important Queries for Interviews
--  Run these after schema.sql and seed.sql
-- ============================================================

USE ecommerce_db;


-- ============================================================
-- SECTION 1: BASIC QUERIES
-- These show you understand SELECT, filtering, sorting
-- ============================================================

-- Q1: Get all products with their category name (INNER JOIN)
SELECT
    p.product_id,
    p.name          AS product_name,
    c.name          AS category,
    p.price,
    p.stock_qty
FROM products p
INNER JOIN categories c ON p.category_id = c.category_id
ORDER BY c.name, p.price;


-- Q2: Get all customers (exclude admins)
SELECT
    user_id,
    name,
    email,
    created_at
FROM users
WHERE role = 'customer'
ORDER BY created_at DESC;


-- Q3: Get all active coupons that haven't expired
SELECT
    code,
    discount_percent,
    min_order_value,
    expiry_date
FROM coupons
WHERE is_active = TRUE
  AND expiry_date >= CURDATE()
ORDER BY discount_percent DESC;


-- Q4: Get all products that are low on stock (less than 50 units)
SELECT
    p.name,
    c.name   AS category,
    p.stock_qty
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.stock_qty < 50
ORDER BY p.stock_qty ASC;


-- ============================================================
-- SECTION 2: JOINS (Most asked in interviews)
-- ============================================================

-- Q5: Get full order history for a specific user (Priya Patel)
-- Shows: order details + items + product names + payment status
SELECT
    o.order_id,
    o.created_at                        AS order_date,
    p.name                              AS product_name,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price)       AS item_total,
    o.discount_amount,
    o.total_amount,
    o.status                            AS order_status,
    pay.method                          AS payment_method,
    pay.status                          AS payment_status
FROM orders o
JOIN order_items oi  ON o.order_id    = oi.order_id
JOIN products p      ON oi.product_id = p.product_id
JOIN payments pay    ON o.order_id    = pay.order_id
WHERE o.user_id = 2   -- Priya Patel
ORDER BY o.created_at DESC;


-- Q6: Get all orders with user name, address and coupon used (LEFT JOIN)
-- LEFT JOIN ensures orders without coupons also appear
SELECT
    o.order_id,
    u.name              AS customer_name,
    CONCAT(a.street, ', ', a.city, ' - ', a.pincode) AS delivery_address,
    c.code              AS coupon_used,
    c.discount_percent,
    o.total_amount,
    o.status,
    o.created_at
FROM orders o
JOIN users u         ON o.user_id    = u.user_id
JOIN addresses a     ON o.address_id = a.address_id
LEFT JOIN coupons c  ON o.coupon_id  = c.coupon_id
ORDER BY o.created_at DESC;


-- Q7: Get all products that have never been ordered (LEFT JOIN + NULL check)
SELECT
    p.product_id,
    p.name,
    p.price,
    p.stock_qty
FROM products p
LEFT JOIN order_items oi ON p.product_id = oi.product_id
WHERE oi.product_id IS NULL;


-- Q8: Get each user's cart with product details and total cart value
SELECT
    u.name                              AS customer_name,
    p.name                              AS product_name,
    cart.quantity,
    p.price                             AS unit_price,
    (cart.quantity * p.price)           AS subtotal
FROM cart
JOIN users u      ON cart.user_id    = u.user_id
JOIN products p   ON cart.product_id = p.product_id
ORDER BY u.name;


-- ============================================================
-- SECTION 3: AGGREGATE QUERIES
-- GROUP BY, HAVING, COUNT, SUM, AVG — very frequently asked
-- ============================================================

-- Q9: Total revenue per category
SELECT
    c.name                          AS category,
    COUNT(DISTINCT o.order_id)      AS total_orders,
    SUM(oi.quantity * oi.unit_price) AS gross_revenue
FROM categories c
JOIN products p     ON c.category_id  = p.category_id
JOIN order_items oi ON p.product_id   = oi.product_id
JOIN orders o       ON oi.order_id    = o.order_id
WHERE o.status != 'cancelled'
GROUP BY c.category_id, c.name
ORDER BY gross_revenue DESC;


-- Q10: Top 5 best-selling products by quantity sold
SELECT
    p.name                      AS product_name,
    c.name                      AS category,
    SUM(oi.quantity)            AS total_units_sold,
    SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM products p
JOIN order_items oi ON p.product_id   = oi.product_id
JOIN orders o       ON oi.order_id    = o.order_id
JOIN categories c   ON p.category_id  = c.category_id
WHERE o.status != 'cancelled'
GROUP BY p.product_id, p.name, c.name
ORDER BY total_units_sold DESC
LIMIT 5;


-- Q11: Average product rating with review count (only products with 1+ review)
SELECT
    p.name                  AS product_name,
    COUNT(r.review_id)      AS total_reviews,
    ROUND(AVG(r.rating), 1) AS avg_rating,
    MIN(r.rating)           AS lowest_rating,
    MAX(r.rating)           AS highest_rating
FROM products p
JOIN reviews r ON p.product_id = r.product_id
GROUP BY p.product_id, p.name
HAVING COUNT(r.review_id) >= 1
ORDER BY avg_rating DESC;


-- Q12: Total orders and spending per customer
SELECT
    u.name                      AS customer_name,
    u.email,
    COUNT(o.order_id)           AS total_orders,
    SUM(o.total_amount)         AS total_spent,
    MAX(o.total_amount)         AS largest_order
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE u.role = 'customer'
GROUP BY u.user_id, u.name, u.email
ORDER BY total_spent DESC;


-- Q13: Monthly revenue report
SELECT
    YEAR(o.created_at)          AS year,
    MONTH(o.created_at)         AS month,
    MONTHNAME(o.created_at)     AS month_name,
    COUNT(o.order_id)           AS total_orders,
    SUM(o.total_amount)         AS total_revenue
FROM orders o
WHERE o.status != 'cancelled'
GROUP BY YEAR(o.created_at), MONTH(o.created_at)
ORDER BY year, month;


-- Q14: Orders pending for more than 2 days (SLA breach check)
SELECT
    o.order_id,
    u.name          AS customer_name,
    o.total_amount,
    o.created_at,
    DATEDIFF(NOW(), o.created_at) AS days_pending
FROM orders o
JOIN users u ON o.user_id = u.user_id
WHERE o.status = 'pending'
  AND DATEDIFF(NOW(), o.created_at) > 2
ORDER BY days_pending DESC;


-- ============================================================
-- SECTION 4: SUBQUERIES
-- ============================================================

-- Q15: Find customers who have spent more than the average order value
SELECT
    u.name,
    u.email,
    SUM(o.total_amount) AS total_spent
FROM users u
JOIN orders o ON u.user_id = o.user_id
WHERE u.role = 'customer'
GROUP BY u.user_id, u.name, u.email
HAVING SUM(o.total_amount) > (
    SELECT AVG(total_amount) FROM orders
)
ORDER BY total_spent DESC;


-- Q16: Get the most expensive product in each category (correlated subquery)
SELECT
    p.name          AS product_name,
    c.name          AS category,
    p.price
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.price = (
    SELECT MAX(p2.price)
    FROM products p2
    WHERE p2.category_id = p.category_id
)
ORDER BY p.price DESC;


-- Q17: Find users who have items in cart but have never placed an order
SELECT
    u.name,
    u.email
FROM users u
WHERE u.user_id IN (SELECT DISTINCT user_id FROM cart)
  AND u.user_id NOT IN (SELECT DISTINCT user_id FROM orders);


-- ============================================================
-- SECTION 5: TRANSACTION (Most important for interviews)
-- Placing an order — touches 3 tables atomically
-- If anything fails, everything rolls back
-- ============================================================

-- Q18: Place a new order (TRANSACTION with ROLLBACK)
START TRANSACTION;

-- Step 1: Insert the order
INSERT INTO orders (user_id, address_id, coupon_id, total_amount, discount_amount, status)
VALUES (4, 4, NULL, 199.00, 0.00, 'pending');

-- Step 2: Get the new order_id
SET @new_order_id = LAST_INSERT_ID();

-- Step 3: Insert order item (Wings of Fire book, product_id = 9)
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES (@new_order_id, 9, 1, 199.00);

-- Step 4: Insert payment record
INSERT INTO payments (order_id, method, status)
VALUES (@new_order_id, 'upi', 'pending');

-- Step 5: Commit if everything succeeded
COMMIT;

-- If anything above fails, run this instead:
-- ROLLBACK;


-- ============================================================
-- SECTION 6: VIEWS
-- Pre-built queries you can call like a table
-- ============================================================

-- View 1: Order summary (joins orders + user + payment)
CREATE OR REPLACE VIEW vw_order_summary AS
SELECT
    o.order_id,
    u.name              AS customer_name,
    u.email,
    o.total_amount,
    o.discount_amount,
    o.status            AS order_status,
    pay.method          AS payment_method,
    pay.status          AS payment_status,
    o.created_at
FROM orders o
JOIN users u    ON o.user_id  = u.user_id
JOIN payments pay ON o.order_id = pay.order_id;

-- Use the view:
SELECT * FROM vw_order_summary;
SELECT * FROM vw_order_summary WHERE order_status = 'pending';


-- View 2: Product performance view
CREATE OR REPLACE VIEW vw_product_performance AS
SELECT
    p.product_id,
    p.name                              AS product_name,
    c.name                              AS category,
    p.price,
    p.stock_qty,
    COALESCE(SUM(oi.quantity), 0)       AS total_sold,
    COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
    COALESCE(COUNT(DISTINCT r.review_id), 0) AS review_count
FROM products p
JOIN categories c         ON p.category_id  = c.category_id
LEFT JOIN order_items oi  ON p.product_id   = oi.product_id
LEFT JOIN reviews r       ON p.product_id   = r.product_id
GROUP BY p.product_id, p.name, c.name, p.price, p.stock_qty;

-- Use the view:
SELECT * FROM vw_product_performance ORDER BY total_sold DESC;
SELECT * FROM vw_product_performance WHERE avg_rating >= 4;


-- ============================================================
-- SECTION 7: INDEX USAGE CHECK
-- Show that your indexes are actually being used
-- ============================================================

-- Q19: Check if index is used on orders.user_id
EXPLAIN SELECT * FROM orders WHERE user_id = 2;

-- Q20: Check index on products.name search
EXPLAIN SELECT * FROM products WHERE name LIKE 'boAt%';

-- Q21: Check index on orders.status
EXPLAIN SELECT * FROM orders WHERE status = 'pending';


-- ============================================================
-- SECTION 8: ORDER STATUS LOG QUERIES
-- ============================================================

-- Q22: Get full status history of a specific order
SELECT
    osl.log_id,
    o.order_id,
    u.name          AS customer_name,
    osl.status,
    osl.changed_at,
    osl.note
FROM order_status_log osl
JOIN orders o ON osl.order_id = o.order_id
JOIN users u  ON o.user_id    = u.user_id
WHERE osl.order_id = 1
ORDER BY osl.changed_at ASC;


-- Q23: Get all orders and how many status changes they've had
SELECT
    o.order_id,
    u.name              AS customer_name,
    o.status            AS current_status,
    COUNT(osl.log_id)   AS status_changes
FROM orders o
JOIN users u            ON o.user_id  = u.user_id
JOIN order_status_log osl ON o.order_id = osl.order_id
GROUP BY o.order_id, u.name, o.status
ORDER BY status_changes DESC;


-- ============================================================
-- SECTION 9: STORED PROCEDURES
-- Reusable logic stored in the DB — very frequently asked
-- ============================================================

-- Procedure 1: Place a complete order in one call
-- Usage: CALL sp_place_order(user_id, address_id, product_id, quantity, payment_method, coupon_code);
-- Example: CALL sp_place_order(3, 3, 1, 2, 'upi', 'WELCOME10');

DELIMITER $$
CREATE PROCEDURE sp_place_order(
    IN  p_user_id       INT,
    IN  p_address_id    INT,
    IN  p_product_id    INT,
    IN  p_quantity      INT,
    IN  p_pay_method    VARCHAR(20),
    IN  p_coupon_code   VARCHAR(50)
)
BEGIN
    -- Declare variables
    DECLARE v_price         DECIMAL(10,2);
    DECLARE v_stock         INT;
    DECLARE v_total         DECIMAL(10,2);
    DECLARE v_discount      DECIMAL(10,2) DEFAULT 0;
    DECLARE v_coupon_id     INT DEFAULT NULL;
    DECLARE v_disc_pct      DECIMAL(5,2) DEFAULT 0;
    DECLARE v_order_id      INT;

    -- Error handler: rollback on any error
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Order placement failed. Transaction rolled back.';
    END;

    START TRANSACTION;

    -- Step 1: Check stock availability
    SELECT price, stock_qty INTO v_price, v_stock
    FROM products WHERE product_id = p_product_id FOR UPDATE;

    IF v_stock < p_quantity THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Insufficient stock. Order cannot be placed.';
    END IF;

    -- Step 2: Apply coupon if provided
    IF p_coupon_code IS NOT NULL AND p_coupon_code != '' THEN
        SELECT coupon_id, discount_percent INTO v_coupon_id, v_disc_pct
        FROM coupons
        WHERE code       = p_coupon_code
          AND is_active  = TRUE
          AND expiry_date >= CURDATE();

        IF v_coupon_id IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Invalid or expired coupon code.';
        END IF;
    END IF;

    -- Step 3: Calculate totals
    SET v_total    = v_price * p_quantity;
    SET v_discount = ROUND(v_total * v_disc_pct / 100, 2);
    SET v_total    = v_total - v_discount;

    -- Step 4: Insert into orders
    INSERT INTO orders (user_id, address_id, coupon_id, total_amount, discount_amount, status)
    VALUES (p_user_id, p_address_id, v_coupon_id, v_total, v_discount, 'pending');

    SET v_order_id = LAST_INSERT_ID();

    -- Step 5: Insert order item
    INSERT INTO order_items (order_id, product_id, quantity, unit_price)
    VALUES (v_order_id, p_product_id, p_quantity, v_price);

    -- Step 6: Insert payment record
    INSERT INTO payments (order_id, method, status)
    VALUES (v_order_id, p_pay_method, 'pending');

    -- Step 7: Commit
    COMMIT;

    -- Return the new order details
    SELECT
        v_order_id   AS order_id,
        v_total      AS total_amount,
        v_discount   AS discount_applied,
        'pending'    AS status,
        'Order placed successfully!' AS message;

END$$
DELIMITER ;

-- Test it:
CALL sp_place_order(3, 3, 1, 1, 'upi', 'WELCOME10');
-- Try with invalid coupon (should throw error):
-- CALL sp_place_order(3, 3, 1, 1, 'upi', 'FAKECODE');
-- Try with out of stock (update stock to 0 first to test):
-- CALL sp_place_order(3, 3, 1, 999, 'upi', '');


-- Procedure 2: Cancel an order and restore stock
-- Usage: CALL sp_cancel_order(order_id);
-- Example: CALL sp_cancel_order(4);

DELIMITER $$
CREATE PROCEDURE sp_cancel_order(
    IN p_order_id INT
)
BEGIN
    DECLARE v_status VARCHAR(20);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cancellation failed. Transaction rolled back.';
    END;

    START TRANSACTION;

    -- Check current order status
    SELECT status INTO v_status
    FROM orders WHERE order_id = p_order_id FOR UPDATE;

    -- Only pending or confirmed orders can be cancelled
    IF v_status NOT IN ('pending', 'confirmed') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Order cannot be cancelled at this stage.';
    END IF;

    -- Update order status to cancelled
    UPDATE orders
    SET status = 'cancelled'
    WHERE order_id = p_order_id;

    -- Update payment status to failed
    UPDATE payments
    SET status = 'failed'
    WHERE order_id = p_order_id;

    COMMIT;

    SELECT
        p_order_id  AS order_id,
        'cancelled' AS status,
        'Order cancelled and stock restored successfully.' AS message;

END$$
DELIMITER ;

-- Test it:
CALL sp_cancel_order(4);
-- Try cancelling a delivered order (should throw error):
-- CALL sp_cancel_order(1);


-- Procedure 3: Get complete order details by order ID
-- Usage: CALL sp_get_order_details(order_id);
-- Example: CALL sp_get_order_details(1);

DELIMITER $$
CREATE PROCEDURE sp_get_order_details(
    IN p_order_id INT
)
BEGIN
    -- Order summary
    SELECT
        o.order_id,
        u.name              AS customer_name,
        u.email,
        CONCAT(a.street, ', ', a.city, ' - ', a.pincode) AS delivery_address,
        o.total_amount,
        o.discount_amount,
        COALESCE(c.code, 'None') AS coupon_used,
        o.status,
        pay.method          AS payment_method,
        pay.status          AS payment_status,
        o.created_at
    FROM orders o
    JOIN users u         ON o.user_id    = u.user_id
    JOIN addresses a     ON o.address_id = a.address_id
    JOIN payments pay    ON o.order_id   = pay.order_id
    LEFT JOIN coupons c  ON o.coupon_id  = c.coupon_id
    WHERE o.order_id = p_order_id;

    -- Order items
    SELECT
        p.name          AS product_name,
        oi.quantity,
        oi.unit_price,
        (oi.quantity * oi.unit_price) AS subtotal
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    WHERE oi.order_id = p_order_id;

    -- Status history
    SELECT
        status,
        changed_at,
        COALESCE(note, '—') AS note
    FROM order_status_log
    WHERE order_id = p_order_id
    ORDER BY changed_at ASC;

END$$
DELIMITER ;

-- Test it:
CALL sp_get_order_details(1);


-- ============================================================
-- SECTION 10: WINDOW FUNCTIONS
-- ROW_NUMBER, RANK, DENSE_RANK, LAG, SUM OVER — asked in
-- product company interviews (Razorpay, Meesho, Groww etc.)
-- ============================================================

-- W1: Rank customers by total spending (RANK)
-- Customers with same spending get the same rank
SELECT
    u.name                          AS customer_name,
    SUM(o.total_amount)             AS total_spent,
    RANK() OVER (
        ORDER BY SUM(o.total_amount) DESC
    )                               AS spending_rank
FROM users u
JOIN orders o ON u.user_id = o.user_id
WHERE u.role = 'customer'
GROUP BY u.user_id, u.name;


-- W2: Rank products by revenue within each category (DENSE_RANK)
-- Great for "top product per category" type questions
SELECT
    c.name                              AS category,
    p.name                              AS product_name,
    SUM(oi.quantity * oi.unit_price)    AS revenue,
    DENSE_RANK() OVER (
        PARTITION BY c.category_id
        ORDER BY SUM(oi.quantity * oi.unit_price) DESC
    )                                   AS rank_in_category
FROM products p
JOIN categories c   ON p.category_id  = c.category_id
JOIN order_items oi ON p.product_id   = oi.product_id
JOIN orders o       ON oi.order_id    = o.order_id
WHERE o.status != 'cancelled'
GROUP BY c.category_id, c.name, p.product_id, p.name;


-- W3: Running total of revenue over time (SUM OVER)
-- Shows cumulative revenue as orders come in — used in dashboards
SELECT
    o.order_id,
    u.name                              AS customer_name,
    o.total_amount,
    o.created_at,
    SUM(o.total_amount) OVER (
        ORDER BY o.created_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    )                                   AS running_total_revenue
FROM orders o
JOIN users u ON o.user_id = u.user_id
WHERE o.status != 'cancelled'
ORDER BY o.created_at;


-- W4: Each order's value vs the customer's average order value (AVG OVER)
-- Shows if a particular order was above or below their usual spending
SELECT
    u.name                          AS customer_name,
    o.order_id,
    o.total_amount,
    ROUND(AVG(o.total_amount) OVER (
        PARTITION BY o.user_id
    ), 2)                           AS customer_avg_order,
    ROUND(o.total_amount - AVG(o.total_amount) OVER (
        PARTITION BY o.user_id
    ), 2)                           AS diff_from_avg
FROM orders o
JOIN users u ON o.user_id = u.user_id
ORDER BY u.name, o.created_at;


-- W5: Row number per customer (ROW_NUMBER)
-- Useful for getting the "Nth order" for a user
SELECT
    u.name          AS customer_name,
    o.order_id,
    o.total_amount,
    o.status,
    o.created_at,
    ROW_NUMBER() OVER (
        PARTITION BY o.user_id
        ORDER BY o.created_at
    )               AS order_number
FROM orders o
JOIN users u ON o.user_id = u.user_id
ORDER BY u.name, order_number;


-- W6: LAG — compare each order's value to the previous order (LAG)
-- "Did this customer spend more or less than last time?"
SELECT
    u.name                          AS customer_name,
    o.order_id,
    o.total_amount,
    o.created_at,
    LAG(o.total_amount) OVER (
        PARTITION BY o.user_id
        ORDER BY o.created_at
    )                               AS previous_order_amount,
    ROUND(o.total_amount - LAG(o.total_amount) OVER (
        PARTITION BY o.user_id
        ORDER BY o.created_at
    ), 2)                           AS change_from_last_order
FROM orders o
JOIN users u ON o.user_id = u.user_id
ORDER BY u.name, o.created_at;