// routes/cart.js
// GET  /cart/:userId      → view cart with product details
// POST /cart              → add item to cart
// PUT  /cart              → update quantity
// DELETE /cart/:userId/:productId → remove item from cart

const express       = require('express');
const router        = express.Router();
const { mysqlPool } = require('../config/db');


// ─── GET /cart/:userId ────────────────────────────────────────────────────────
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [items] = await mysqlPool.query(`
            SELECT
                c.cart_id,
                c.product_id,
                p.name          AS product_name,
                p.price         AS unit_price,
                c.quantity,
                (p.price * c.quantity) AS subtotal,
                p.stock_qty,
                cat.name        AS category
            FROM cart c
            JOIN products p    ON c.product_id  = p.product_id
            JOIN categories cat ON p.category_id = cat.category_id
            WHERE c.user_id = ?
            ORDER BY c.added_at DESC
        `, [userId]);

        // Calculate cart total
        const cartTotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

        res.json({
            success    : true,
            user_id    : parseInt(userId),
            item_count : items.length,
            cart_total : cartTotal.toFixed(2),
            items
        });

    } catch (error) {
        console.error('GET /cart/:userId error:', error.message);
        res.status(500).json({ error: error.message });
    }
});


// ─── POST /cart ───────────────────────────────────────────────────────────────
// Add item to cart — if already exists, update quantity
router.post('/', async (req, res) => {
    try {
        const { user_id, product_id, quantity = 1 } = req.body;

        if (!user_id || !product_id) {
            return res.status(400).json({
                error: 'user_id and product_id are required'
            });
        }

        // Check if product exists and has enough stock
        const [products] = await mysqlPool.query(
            'SELECT product_id, name, price, stock_qty FROM products WHERE product_id = ?',
            [product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (products[0].stock_qty < quantity) {
            return res.status(400).json({
                error: `Only ${products[0].stock_qty} units available in stock`
            });
        }

        // INSERT or UPDATE if already in cart (ON DUPLICATE KEY UPDATE)
        await mysqlPool.query(`
            INSERT INTO cart (user_id, product_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `, [user_id, product_id, quantity]);

        res.status(201).json({
            success : true,
            message : `${products[0].name} added to cart`
        });

    } catch (error) {
        console.error('POST /cart error:', error.message);
        res.status(500).json({ error: error.message });
    }
});


// ─── PUT /cart ────────────────────────────────────────────────────────────────
// Update quantity of an item in cart
router.put('/', async (req, res) => {
    try {
        const { user_id, product_id, quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ error: 'Quantity must be at least 1' });
        }

        await mysqlPool.query(
            'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
            [quantity, user_id, product_id]
        );

        res.json({ success: true, message: 'Cart updated' });

    } catch (error) {
        console.error('PUT /cart error:', error.message);
        res.status(500).json({ error: error.message });
    }
});


// ─── DELETE /cart/:userId/:productId ─────────────────────────────────────────
router.delete('/:userId/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;

        await mysqlPool.query(
            'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        res.json({ success: true, message: 'Item removed from cart' });

    } catch (error) {
        console.error('DELETE /cart error:', error.message);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
