const { createTable } = require("./query");

// Define all table schemas
const tableSchemas = {
  posts: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  `,

  users: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('admin', 'user', 'moderator') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  `,

  categories: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
  `,

  comments: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT,
    author_name VARCHAR(100),
    author_email VARCHAR(255),
    content TEXT NOT NULL,
    status ENUM('pending', 'approved', 'spam') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  `,

  tags: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `,

  post_tags: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_tag (post_id, tag_id)
  `,

  settings: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  `,
};

// Function to create all tables
async function createAllTables() {
  const results = [];

  for (const [tableName, schema] of Object.entries(tableSchemas)) {
    try {
      await new Promise((resolve, reject) => {
        createTable(tableName, schema, (err, result) => {
          if (err) {
            console.error(`❌ Error creating table ${tableName}:`, err.message);
            reject(err);
          } else {
            console.log(
              `✅ Table ${tableName} ready (created or already exists)`
            );
            results.push({ table: tableName, status: "success" });
            resolve(result);
          }
        });
      });
    } catch (error) {
      results.push({ table: tableName, status: "error", error: error.message });
    }
  }

  return results;
}

// Function to create a specific table
function createSpecificTable(tableName, callback) {
  if (!tableSchemas[tableName]) {
    return callback(new Error(`Table schema not found for: ${tableName}`));
  }

  createTable(tableName, tableSchemas[tableName], callback);
}

// Function to get all table names
function getTableNames() {
  return Object.keys(tableSchemas);
}

// Function to get table schema
function getTableSchema(tableName) {
  return tableSchemas[tableName];
}

module.exports = {
  createAllTables,
  createSpecificTable,
  getTableNames,
  getTableSchema,
  tableSchemas,
};
