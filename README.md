# 🛒 E-Commerce Order Management System

A full-stack order management system built with **MySQL**, **MongoDB**, and **Node.js**, demonstrating real-world database concepts for SDE roles.

---

## 📌 Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Database Architecture](#database-architecture)
- [Schema Design](#schema-design)
- [Key Concepts Demonstrated](#key-concepts-demonstrated)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Sample API Calls](#sample-api-calls)

---

## Overview

This project simulates a real-world e-commerce backend system with features like:
- User registration and login with JWT authentication
- Product catalog with category-wise filtering
- Shopping cart management
- Order placement with ACID transactions
- Coupon and discount system
- Payment tracking
- Order status audit trail
- Product reviews and ratings

---

## Tech Stack

| Layer | Technology |
|---|---|
| Relational Database | MySQL 8.0 |
| Document Database | MongoDB Atlas |
| Backend Framework | Node.js + Express |
| ORM / Query | mysql2, Mongoose |
| Authentication | JWT + bcryptjs |
| GUI Tools | MySQL Workbench, MongoDB Compass |

---

## Database Architecture

This project uses a **polyglot persistence** approach — two databases, each used for what it does best:

```
┌─────────────────────────────┐     ┌──────────────────────────────┐
│          MySQL              │     │          MongoDB              │
│  (Relational / ACID)        │     │  (Document / Flexible)       │
│                             │     │                              │
│  - users                    │     │  - Product descriptions      │
│  - orders                   │     │  - Category-specific specs   │
│  - order_items              │     │  - Image URLs                │
│  - payments                 │     │  - Tags and highlights       │
│  - cart                     │     │  - Nutritional info (food)   │
│  - reviews                  │     │  - Size guides (clothing)    │
│  - coupons                  │     │  - Author info (books)       │
│  - addresses                │     │                              │
│  - order_status_log         │     │  Linked via mysql_product_id │
└─────────────────────────────┘     └──────────────────────────────┘
```

**Why two databases?**
Product attributes vary completely by category — Electronics need battery/RAM/storage, Clothing needs size/fabric/fit, Books need ISBN/author/pages, Food needs nutritional info/allergens. Storing all of this in MySQL would require 40+ nullable columns or a messy EAV table. MongoDB handles flexible schemas naturally.

---

## Schema Design

### ER Diagram
![ER Diagram](diagrams/er-diagram.png)

### MySQL Tables (11 tables)

| Table | Description |
|---|---|
| `users` | Customer and admin accounts |
| `categories` | Product categories |
| `products` | Product inventory with price and stock |
| `addresses` | User delivery addresses |
| `cart` | Active cart items per user |
| `coupons` | Discount codes with expiry |
| `orders` | Order records with status |
| `order_items` | Individual items within each order |
| `payments` | Payment records per order |
| `reviews` | Product ratings and comments |
| `order_status_log` | Full audit trail of order status changes |

### Key Design Decisions

**`unit_price` stored in `order_items`** — Product prices can change over time, but order history must reflect what the customer actually paid at the time of purchase.

**Nullable `coupon_id` in orders** — Coupons are optional. `ON DELETE SET NULL` ensures old orders aren't broken if a coupon is deleted later.

**`UNIQUE(user_id, product_id)` in reviews and cart** — Enforced at the database level, not just application level. A user can only review a product once and can't have duplicate cart entries.

**`ON DELETE CASCADE` on order_items** — Deleting an order automatically removes its items, keeping the database clean.

---

## Key Concepts Demonstrated

### 1. Normalization (3NF)
All tables are normalized to Third Normal Form — no transitive dependencies, no repeating groups.

### 2. Indexing Strategy
```sql
-- Login queries always filter by email
CREATE INDEX idx_users_email ON users(email);

-- Order history queries filter by user
CREATE INDEX idx_orders_user ON orders(user_id);

-- Admin dashboard filters by status
CREATE INDEX idx_orders_status ON orders(status);

-- Fetch all items in an order (most frequent join)
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### 3. ACID Transactions
Order placement touches 3 tables atomically — if payment insertion fails, the order and items are rolled back:
```sql
START TRANSACTION;
  INSERT INTO orders ...
  INSERT INTO order_items ...  -- triggers stock deduction
  INSERT INTO payments ...
COMMIT;
-- ROLLBACK on any failure
```

### 4. Triggers (4 triggers)
| Trigger | When | What it does |
|---|---|---|
| `trg_deduct_stock` | After order_item insert | Auto-reduces product stock |
| `trg_restore_stock` | After order cancelled | Auto-restores product stock |
| `trg_log_status_change` | After order update | Logs every status change |
| `trg_log_new_order` | After order insert | Logs initial "pending" status |

### 5. Views
```sql
-- Pre-built order summary joining 3 tables
SELECT * FROM vw_order_summary WHERE order_status = 'pending';

-- Product performance with sales and ratings
SELECT * FROM vw_product_performance ORDER BY total_sold DESC;
```

### 6. Stored Procedures (3 procedures)
```sql
-- Place a complete order in one call
CALL sp_place_order(3, 3, 1, 1, 'upi', 'WELCOME10');

-- Cancel an order with status validation
CALL sp_cancel_order(4);

-- Get full order details in one call
CALL sp_get_order_details(1);
```

### 7. Window Functions
```sql
-- Rank customers by spending
RANK() OVER (ORDER BY SUM(total_amount) DESC)

-- Running revenue total over time
SUM(total_amount) OVER (ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)

-- Compare each order to customer's own average
AVG(total_amount) OVER (PARTITION BY user_id)
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API health check |
| GET | `/products` | All products (MySQL + MongoDB merged) |
| GET | `/products/:id` | Single product with full details |
| POST | `/users/register` | Register new user |
| POST | `/users/login` | Login and get JWT token |
| GET | `/cart/:userId` | View cart with totals |
| POST | `/cart` | Add item to cart |
| PUT | `/cart` | Update cart quantity |
| DELETE | `/cart/:userId/:productId` | Remove item from cart |
| POST | `/orders` | Place order (ACID transaction) |
| GET | `/orders/:userId` | Order history for a user |
| GET | `/orders/detail/:orderId` | Full order details with timeline |
| PUT | `/orders/:orderId/status` | Update order status |

---

## Project Structure

```
ecommerce-order-management/
├── README.md
├── diagrams/
│   └── er-diagram.png
├── database/
│   ├── schema.sql          # All 11 tables, indexes, triggers, views
│   ├── seed.sql            # Sample Indian data (12 products, 6 users)
│   └── queries.sql         # Key queries, stored procedures, window functions
└── backend/
    ├── server.js           # Express server entry point
    ├── .env.example        # Environment variable template
    ├── config/
    │   └── db.js           # MySQL pool + MongoDB connection
    └── routes/
        ├── products.js     # Product endpoints (MySQL + MongoDB merge)
        ├── users.js        # Register + Login with JWT
        ├── cart.js         # Cart CRUD
        └── orders.js       # Order placement with transaction
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL 8.0
- MongoDB Atlas account (free tier)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ecommerce-order-management.git
cd ecommerce-order-management
```

### 2. Set up MySQL database
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 3. Set up the backend
```bash
cd backend
npm install
```

### 4. Create your .env file
```bash
cp .env.example .env
```

Fill in your credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecommerce_db
PORT=3000
JWT_SECRET=your_secret_key
```

### 5. Import MongoDB product data
- Open MongoDB Compass
- Connect to your Atlas cluster
- Navigate to `ecommerce_db` → `products`
- Import `database/products.json`

### 6. Start the server
```bash
node server.js
```

Server runs at `http://localhost:3000`

---

## Sample API Calls

### Register a user
```bash
POST /users/register
{
  "name": "Rohan Desai",
  "email": "rohan@gmail.com",
  "password": "rohan1234"
}
```

### Place an order with coupon
```bash
POST /orders
{
  "user_id": 7,
  "address_id": 1,
  "payment_method": "upi",
  "coupon_code": "WELCOME10",
  "items": [
    { "product_id": 1, "quantity": 1 },
    { "product_id": 9, "quantity": 1 }
  ]
}
```

### Response
```json
{
  "success": true,
  "message": "Order placed successfully!",
  "order_id": 6,
  "total_amount": 1528.20,
  "discount_applied": 169.80,
  "payment_method": "upi",
  "status": "pending"
}
```

---

## Author
Built as a DBMS project for SDE campus placements.
