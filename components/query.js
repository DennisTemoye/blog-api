const mysql = require("../db");

function selectAll(table, res) {
  // Validate table name to prevent SQL injection
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  mysql.query(
    `SELECT * FROM ${table} ORDER BY created_at DESC`,
    (err, results) => {
      if (err) {
        res.status(500).json({ error: `Error fetching from ${table}` });
      } else {
        res.json(results);
      }
    }
  );
}

function select(table, id, res) {
  // Validate table name to prevent SQL injection
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  mysql.query(`SELECT * FROM ${table} WHERE id = ?`, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: `Error fetching from ${table}` });
    } else if (results.length === 0) {
      res.status(404).json({ error: `${table} not found` });
    } else {
      res.json(results[0]);
    }
  });
}

function insert(table, data, res) {
  // Validate table name to prevent SQL injection
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map(() => "?").join(", ");

  mysql.query(
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`,
    values,
    (err, results) => {
      if (err) {
        res.status(500).json({ error: `Error creating ${table}` });
      } else {
        res.status(201).json({
          id: results.insertId,
          message: `${table} created successfully`,
          data: { ...data, id: results.insertId },
        });
      }
    }
  );
}

function update(table, id, data, res) {
  // Validate table name to prevent SQL injection
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  const columns = Object.keys(data);
  const values = Object.values(data);
  const setClause = columns.map((col) => `${col} = ?`).join(", ");

  mysql.query(
    `UPDATE ${table} SET ${setClause} WHERE id = ?`,
    [...values, id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: `Error updating ${table}` });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ error: `${table} not found` });
      } else {
        res.json({
          message: `${table} updated successfully`,
          affectedRows: results.affectedRows,
        });
      }
    }
  );
}

function remove(table, id, res) {
  // Validate table name to prevent SQL injection
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  mysql.query(`DELETE FROM ${table} WHERE id = ?`, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: `Error deleting ${table}` });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: `${table} not found` });
    } else {
      res.json({
        message: `${table} deleted successfully`,
        affectedRows: results.affectedRows,
      });
    }
  });
}

function createTable(tableName, schema, callback) {
  // Validate table name to prevent SQL injection
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    return callback(new Error("Invalid table name"));
  }

  mysql.query(
    `CREATE TABLE IF NOT EXISTS ${tableName} (${schema})`,
    (err, results) => {
      if (err) {
        callback(err);
      } else {
        callback(null, results);
      }
    }
  );
}

module.exports = { selectAll, select, insert, update, remove, createTable };
