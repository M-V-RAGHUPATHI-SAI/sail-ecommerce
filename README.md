# Sail - E-commerce Platform

A clean, modern, and fully functional Node.js + Express + MySQL e-commerce application. 
Originally built as a DBMS project, it has been heavily refactored into a professional Model-View-Controller (MVC) structure suitable for production environments and developer portfolios.

## 🚀 Features
- **User Authentication**: Secure signup and login using bcrypt password hashing.
- **Session Management**: Cart and checkout routes are protected by robust login middlewares.
- **Isolated Shopping Cart**: Unique shopping carts mapping explicitly to each user session to prevent data leakage.
- **Product Catalog**: Dynamic, database-driven product pages replacing static HTML bloat.
- **Search System**: Find products quickly via database pattern matching.
- **Order Pipeline**: Complete checkout flow generating orders with dynamic tracking statuses (Placed, Packed, Shipped, Delivered, Cancelled).
- **Admin Dashboard**: A secure portal for administrators to manage inventory (CRUD) and update the fulfillment status of user orders.

## 💻 Tech Stack
- **Backend Environment**: Node.js
- **Web Framework**: Express.js
- **Templating Engine**: EJS (Embedded JavaScript)
- **Database**: MySQL (using `mysql2/promise` with connection pooling)
- **Security**: `bcrypt` for hashing, parameterised SQL queries to prevent SQL injections.

## 📂 Project Structure
```text
project-root
├── config/              # Database connection pools & environment handling
├── controllers/         # Core request logic (auth, product, cart, orders, admin)
├── database/            # Centralized SQL query definitions
├── middleware/          # Route protection and admin auth checks
├── public/              # Static assets (images, css, client-js)
├── routes/              # Express routing modules
├── views/               # EJS UI templates
├── server.js            # Main application entry point
└── .env                 # Secret environment variables
```

## 🛠 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd dbms-project
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Ensure you have a `.env` file in the root containing your database credentials:
   ```env
   MYSQL_HOST=127.0.0.1
   MYSQL_USER=root
   MYSQL_PASSWORD=yourpassword
   MYSQL_DATABASE=saildb
   ```

4. **Initialize Database**:
   Verify your MySQL server is running, then import the schema:
   ```bash
   mysql -u root -p < schema.sql
   ```
   *(Note: The schema includes the `customer_id` mapping for cart isolation and the modern `o_status` enum logic).*

5. **Start the server**:
   ```bash
   npm run dev
   # OR
   node server.js
   ```

6. **Access the application**:
   Open a browser and navigate to `http://localhost:8080`.

## 🛡 Security & Best Practices Implemented
- **Parameterization**: All DB inputs are sanitized by the `mysql2` driver parameters arrays (`[val1, val2]`), destroying SQL injection vulnerabilities.
- **Modularization**: Code logic split cleanly into respective controllers. No spaghetti routing inside `server.js`.
- **Error Handling**: Graceful try/catch blocks intercepting controller crashes to keep the server alive and return proper HTTP 500 pages.
- **Session Segregation**: Carts are bound to `customer_id` via SQL foreign constraints ensuring privacy.

## 👤 Admin Access
Any user attempting to hit `/admin` requires login. For demonstration, the system currently assumes `admin@sail.in` is an administrator. Modify `middleware/authMiddleware.js` for your specific scoping needs.

*(This beautiful project is ready to set sail!)*
