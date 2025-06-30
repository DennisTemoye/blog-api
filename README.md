# Express Demo Server

A Node.js Express server with MySQL database integration that automatically creates tables on startup.

## Features

- ✅ Automatic table creation on server startup
- ✅ RESTful API for customer management
- ✅ MySQL database integration
- ✅ Express.js web framework
- ✅ Security middleware (Helmet)
- ✅ Request logging (Morgan)

## Prerequisites

- Node.js (v14 or higher)
- MySQL server running locally
- MySQL database named "test" (or update db.js configuration)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure database connection in `db.js`:

```javascript
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Update with your MySQL password
  database: "test", // Update with your database name
});
```

## Usage

### Start the server:

```bash
npm start
```

### Development mode (with auto-restart):

```bash
npm run dev
```

### Test database connection:

```bash
npm test
```

## What happens when you start the server

1. **Database Connection**: The server connects to MySQL database
2. **Table Creation**: Automatically creates a `customers` table if it doesn't exist
3. **Server Startup**: Express server starts on port 3000 (or PORT environment variable)

## API Endpoints

### Customers API (`/api/customers`)

- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create a new customer
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Example Usage

Create a customer:

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

Get all customers:

```bash
curl http://localhost:3000/api/customers
```

## Database Schema

The `customers` table is automatically created with the following structure:

```sql
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Server Output

When you start the server, you should see:

```
Connected to MySQL database
Customers table ready (created or already exists)
Listening on port 3000...
```

## Troubleshooting

1. **Database connection error**: Check MySQL server is running and credentials in `db.js`
2. **Table creation error**: Ensure database exists and user has CREATE privileges
3. **Port already in use**: Change PORT environment variable or kill existing process

## Project Structure

```
express-demo/
├── index.js          # Main server file
├── db.js            # Database connection
├── routes/          # API routes
│   ├── customers.js # Customer CRUD operations
│   ├── courses.js   # Course routes
│   └── home.js      # Home routes
├── middleware/      # Custom middleware
├── views/          # Pug templates
├── public/         # Static files
└── config/         # Configuration files
```
