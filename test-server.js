const mysql = require("./db");

// Test database connection and table creation
console.log("Testing database connection and table creation...");

const testQuery = `
  CREATE TABLE IF NOT EXISTS test_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

mysql.query(testQuery, (err, results) => {
  if (err) {
    console.error("❌ Database test failed:", err.message);
    process.exit(1);
  } else {
    console.log("✅ Database connection successful");
    console.log("✅ Table creation test passed");

    // Clean up test table
    mysql.query("DROP TABLE IF EXISTS test_table", (err) => {
      if (err) {
        console.log("⚠️  Could not clean up test table:", err.message);
      } else {
        console.log("✅ Test cleanup completed");
      }
      mysql.end();
      console.log("🎉 All tests passed! Your server is ready to run.");
    });
  }
});
