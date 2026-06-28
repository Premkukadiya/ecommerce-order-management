// config/db.js
// Handles both MySQL and MongoDB connections

const mysql     = require('mysql2/promise');
const mongoose  = require('mongoose');
require('dotenv').config();

// ─── MySQL Connection Pool ───────────────────────────────────────────────────
// We use a pool (not a single connection) so multiple requests
// can share connections without waiting for each other
const mysqlPool = mysql.createPool({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    waitForConnections : true,
    connectionLimit    : 10,   // max 10 simultaneous connections
    queueLimit         : 0
});

// ─── MongoDB Connection ──────────────────────────────────────────────────────
const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

// ─── Test MySQL Connection ───────────────────────────────────────────────────
const testMySQL = async () => {
    try {
        const connection = await mysqlPool.getConnection();
        console.log('✅ MySQL connected successfully');
        connection.release();
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = { mysqlPool, connectMongo, testMySQL };
