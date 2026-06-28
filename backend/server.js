// server.js
// Main entry point — starts the Express server

const express       = require('express');
const cors          = require('cors');
require('dotenv').config();

const { connectMongo, testMySQL } = require('./config/db');

// Import routes
const productRoutes = require('./routes/products');
const userRoutes    = require('./routes/users');
const cartRoutes    = require('./routes/cart');
const orderRoutes   = require('./routes/orders');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());                    // allow cross-origin requests
app.use(express.json());            // parse incoming JSON body

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/products', productRoutes);
app.use('/users',    userRoutes);
app.use('/cart',     cartRoutes);
app.use('/orders',   orderRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        message : '🛒 E-Commerce API is running!',
        version : '1.0.0',
        endpoints: {
            products : 'GET /products',
            product  : 'GET /products/:id',
            register : 'POST /users/register',
            login    : 'POST /users/login',
            cart     : 'GET /cart/:userId',
            addCart  : 'POST /cart',
            orders   : 'GET /orders/:userId',
            placeOrder: 'POST /orders'
        }
    });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ────────────────────────────────────────────────────────────
const startServer = async () => {
    await testMySQL();       // test MySQL connection first
    await connectMongo();    // then connect MongoDB

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📖 API docs at http://localhost:${PORT}/`);
    });
};

startServer();
