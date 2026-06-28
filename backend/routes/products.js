// routes/products.js
// GET /products       → all products (MySQL + MongoDB merged)
// GET /products/:id   → single product full details

const express       = require('express');
const router        = express.Router();
const { mysqlPool } = require('../config/db');
const mongoose      = require('mongoose');

// ─── MongoDB Schema for Product ───────────────────────────────────────────────
// Flexible schema — different categories have different specs
const productSchema = new mongoose.Schema({
    mysql_product_id : Number,
    name             : String,
    category         : String,
    brand            : String,
    description      : String,
    images           : [String],
    specs            : mongoose.Schema.Types.Mixed,  // flexible — any object
    tags             : [String],
    highlights       : [String],
    rating_summary   : mongoose.Schema.Types.Mixed,
    is_active        : Boolean
}, { collection: 'products' });

const Product = mongoose.model('Product', productSchema);


// ─── GET /products ────────────────────────────────────────────────────────────
// Returns all products with MySQL price/stock + MongoDB description/specs
router.get('/', async (req, res) => {
    try {
        // Step 1: Get all products from MySQL
        const [mysqlProducts] = await mysqlPool.query(`
            SELECT
                p.product_id,
                p.name,
                p.price,
                p.stock_qty,
                c.name AS category
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            ORDER BY p.product_id
        `);

        // Step 2: Get all product details from MongoDB
        const mongoProducts = await Product.find(
            { is_active: true },
            { mysql_product_id: 1, brand: 1, images: 1,
              highlights: 1, rating_summary: 1, tags: 1 }
        );

        // Step 3: Create a lookup map from MongoDB (key = mysql_product_id)
        const mongoMap = {};
        mongoProducts.forEach(p => {
            mongoMap[p.mysql_product_id] = p;
        });

        // Step 4: Merge MySQL + MongoDB data
        const merged = mysqlProducts.map(p => ({
            product_id     : p.product_id,
            name           : p.name,
            price          : p.price,
            stock_qty      : p.stock_qty,
            category       : p.category,
            brand          : mongoMap[p.product_id]?.brand || null,
            thumbnail      : mongoMap[p.product_id]?.images?.[0] || null,
            highlights     : mongoMap[p.product_id]?.highlights || [],
            avg_rating     : mongoMap[p.product_id]?.rating_summary?.average || 0,
            tags           : mongoMap[p.product_id]?.tags || []
        }));

        res.json({
            success : true,
            count   : merged.length,
            products: merged
        });

    } catch (error) {
        console.error('GET /products error:', error.message);
        res.status(500).json({ error: error.message });
    }
});


// ─── GET /products/:id ────────────────────────────────────────────────────────
// Returns single product with FULL details from both databases
router.get('/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        // Step 1: Get product from MySQL
        const [rows] = await mysqlPool.query(`
            SELECT
                p.product_id,
                p.name,
                p.price,
                p.stock_qty,
                c.name AS category,
                c.category_id
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            WHERE p.product_id = ?
        `, [productId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const mysqlProduct = rows[0];

        // Step 2: Get full details from MongoDB
        const mongoProduct = await Product.findOne({
            mysql_product_id: productId
        });

        // Step 3: Get reviews from MySQL
        const [reviews] = await mysqlPool.query(`
            SELECT
                r.rating,
                r.comment,
                r.created_at,
                u.name AS reviewer_name
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `, [productId]);

        // Step 4: Merge everything
        const fullProduct = {
            ...mysqlProduct,
            brand          : mongoProduct?.brand || null,
            description    : mongoProduct?.description || null,
            images         : mongoProduct?.images || [],
            specs          : mongoProduct?.specs || {},
            highlights     : mongoProduct?.highlights || [],
            tags           : mongoProduct?.tags || [],
            in_the_box     : mongoProduct?.in_the_box || [],
            rating_summary : mongoProduct?.rating_summary || {},
            reviews        : reviews
        };

        res.json({ success: true, product: fullProduct });

    } catch (error) {
        console.error('GET /products/:id error:', error.message);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
