// routes/orders.js
// POST /orders           → place a new order (MySQL transaction)
// GET  /orders/:userId   → get order history for a user
// GET  /orders/detail/:orderId → get full order details
// PUT  /orders/:orderId/status → update order status (admin)

const express       = require('express');
const router        = express.Router();
const { mysqlPool } = require('../config/db');


// ─── POST /orders ─────────────────────────────────────────────────────────────
// Places a full order using a MySQL transaction
// If anything fails — everything rolls back
router.post('/', async (req, res) => {
    // Get a dedicated connection for the transaction
    const connection = await mysqlPool.getConnection();

    try {
        const { user_id, address_id, items, payment_method, coupon_code } = req.body;

        // Validate required fields
        if (!user_id || !address_id || !items || items.length === 0 || !payment_method) {
            return res.status(400).json({
                error: 'user_id, address_id, items and payment_method are required'
            });
        }

        // ── START TRANSACTION ──
        await connection.beginTransaction();

        let totalAmount    = 0;
        let discountAmount = 0;
        let couponId       = null;
        const orderItems   = [];

        // Step 1: Validate each item and check stock
        for (const item of items) {
            const [products] = await connection.query(
                'SELECT product_id, name, price, stock_qty FROM products WHERE product_id = ? FOR UPDATE',
                [item.product_id]
            );

            if (products.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    error: `Product ID ${item.product_id} not found`
                });
            }

            const product = products[0];

            if (product.stock_qty < item.quantity) {
                await connection.rollback();
                return res.status(400).json({
                    error: `Insufficient stock for ${product.name}. Available: ${product.stock_qty}`
                });
            }

            const itemTotal = product.price * item.quantity;
            totalAmount    += itemTotal;

            orderItems.push({
                product_id : product.product_id,
                quantity   : item.quantity,
                unit_price : product.price
            });
        }

        // Step 2: Apply coupon if provided
        if (coupon_code) {
            const [coupons] = await connection.query(`
                SELECT coupon_id, discount_percent, min_order_value
                FROM coupons
                WHERE code = ? AND is_active = TRUE AND expiry_date >= CURDATE()
            `, [coupon_code]);

            if (coupons.length === 0) {
                await connection.rollback();
                return res.status(400).json({ error: 'Invalid or expired coupon code' });
            }

            const coupon = coupons[0];

            if (totalAmount < coupon.min_order_value) {
                await connection.rollback();
                return res.status(400).json({
                    error: `Minimum order value for this coupon is ₹${coupon.min_order_value}`
                });
            }

            discountAmount = (totalAmount * coupon.discount_percent) / 100;
            discountAmount = Math.round(discountAmount * 100) / 100;
            couponId       = coupon.coupon_id;
            totalAmount    = totalAmount - discountAmount;
        }

        // Step 3: Create the order
        const [orderResult] = await connection.query(`
            INSERT INTO orders (user_id, address_id, coupon_id, total_amount, discount_amount, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
        `, [user_id, address_id, couponId, totalAmount, discountAmount]);

        const orderId = orderResult.insertId;

        // Step 4: Insert all order items
        for (const item of orderItems) {
            await connection.query(`
                INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                VALUES (?, ?, ?, ?)
            `, [orderId, item.product_id, item.quantity, item.unit_price]);
        }

        // Step 5: Insert payment record
        await connection.query(`
            INSERT INTO payments (order_id, method, status)
            VALUES (?, ?, 'pending')
        `, [orderId, payment_method]);

        // ── COMMIT TRANSACTION ──
        await connection.commit();

        res.status(201).json({
            success         : true,
            message         : 'Order placed successfully!',
            order_id        : orderId,
            total_amount    : totalAmount,
            discount_applied: discountAmount,
            payment_method,
            status          : 'pending'
        });

    } catch (error) {
        // ── ROLLBACK on any error ──
        await connection.rollback();
        console.error('POST /orders error:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        // Always release connection back to pool
        connection.release();
    }
});


// ─── GET /orders/:userId ──────────────────────────────────────────────────────
// Get full order history for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [orders] = await mysqlPool.query(`
            SELECT
                o.order_id,
                o.total_amount,
                o.discount_amount,
                o.status,
                o.created_at,
                pay.method      AS payment_method,
                pay.status      AS payment_status,
                c.code          AS coupon_used,
                COUNT(oi.item_id) AS item_count
            FROM orders o
            JOIN payments pay    ON o.order_id   = pay.order_id
            LEFT JOIN coupons c  ON o.coupon_id  = c.coupon_id
            JOIN order_items oi  ON o.order_id   = oi.order_id
            WHERE o.user_id = ?
            GROUP BY o.order_id, pay.method, pay.status, c.code
            ORDER BY o.created_at DESC
        `, [userId]);

        res.json({
            success     : true,
            user_id     : parseInt(userId),
            order_count : orders.length,
            orders
        });

    } catch (error) {
        console.error('GET /orders/:userId error:', error.message);
        res.status(500).json({ error: error.message });
    }
});


// ─── GET /orders/detail/:orderId ──────────────────────────────────────────────
// Get full details of a specific order including all items
router.get('/detail/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        // Get order summary
        const [orders] = await mysqlPool.query(`
            SELECT
                o.order_id,
                u.name          AS customer_name,
                u.email,
                CONCAT(a.street, ', ', a.city, ' - ', a.pincode) AS delivery_address,
                o.total_amount,
                o.discount_amount,
                o.status,
                o.created_at,
                pay.method      AS payment_method,
                pay.status      AS payment_status,
                COALESCE(c.code, 'None') AS coupon_used
            FROM orders o
            JOIN users u         ON o.user_id    = u.user_id
            JOIN addresses a     ON o.address_id = a.address_id
            JOIN payments pay    ON o.order_id   = pay.order_id
            LEFT JOIN coupons c  ON o.coupon_id  = c.coupon_id
            WHERE o.order_id = ?
        `, [orderId]);

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Get order items
        const [items] = await mysqlPool.query(`
            SELECT
                p.name      AS product_name,
                oi.quantity,
                oi.unit_price,
                (oi.quantity * oi.unit_price) AS subtotal
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
        `, [orderId]);

        // Get status history
        const [statusLog] = await mysqlPool.query(`
            SELECT status, changed_at, note
            FROM order_status_log
            WHERE order_id = ?
            ORDER BY changed_at ASC
        `, [orderId]);

        res.json({
            success  : true,
            order    : orders[0],
            items,
            timeline : statusLog
        });

    } catch (error) {
        console.error('GET /orders/detail/:orderId error:', error.message);
        res.status(500).json({ error: error.message });
    }
});


// ─── PUT /orders/:orderId/status ──────────────────────────────────────────────
// Update order status (admin use)
router.put('/:orderId/status', async (req, res) => {
    try {
        const { orderId }  = req.params;
        const { status }   = req.body;

        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        await mysqlPool.query(
            'UPDATE orders SET status = ? WHERE order_id = ?',
            [status, orderId]
        );

        res.json({
            success  : true,
            message  : `Order #${orderId} status updated to "${status}"`,
            order_id : parseInt(orderId),
            status
        });

    } catch (error) {
        console.error('PUT /orders/:orderId/status error:', error.message);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
