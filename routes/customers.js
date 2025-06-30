const express = require("express");
const router = express.Router();
const mysql = require("../db");

// Create table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// Initialize table on route load
mysql.query(createTableQuery, (err, results) => {
  if (err) {
    console.error("Error creating customers table:", err.message);
  } else {
    console.log("Customers table ready");
  }
});

// GET all customers
router.get("/", (req, res) => {
  mysql.query("SELECT * FROM customers", (err, results) => {
    if (err) {
      res.status(500).json({ error: "Error fetching customers" });
    } else {
      res.json(results);
    }
  });
});

// POST create new customer
router.post("/", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  mysql.query(
    "INSERT INTO customers (name, email) VALUES (?, ?)",
    [name, email],
    (err, results) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          res.status(400).json({ error: "Email already exists" });
        } else {
          res.status(500).json({ error: "Error creating customer" });
        }
      } else {
        res.status(201).json({
          id: results.insertId,
          name,
          email,
          message: "Customer created successfully",
        });
      }
    }
  );
});

// GET customer by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;

  mysql.query("SELECT * FROM customers WHERE id = ?", [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Error fetching customer" });
    } else if (results.length === 0) {
      res.status(404).json({ error: "Customer not found" });
    } else {
      res.json(results[0]);
    }
  });
});

// PUT update customer
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  mysql.query(
    "UPDATE customers SET name = ?, email = ? WHERE id = ?",
    [name, email, id],
    (err, results) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          res.status(400).json({ error: "Email already exists" });
        } else {
          res.status(500).json({ error: "Error updating customer" });
        }
      } else if (results.affectedRows === 0) {
        res.status(404).json({ error: "Customer not found" });
      } else {
        res.json({ message: "Customer updated successfully" });
      }
    }
  );
});

// DELETE customer
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  mysql.query("DELETE FROM customers WHERE id = ?", [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Error deleting customer" });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: "Customer not found" });
    } else {
      res.json({ message: "Customer deleted successfully" });
    }
  });
});

module.exports = router;
