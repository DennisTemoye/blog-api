// const mongoose = require("mongoose");
// mongoose
//   .connect("mongodb://localhost/playground")
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("Could not conntect to db"));

const debug = require("debug")("app:startup");
require("dotenv").config();

const config = require("config");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const logger = require("./middleware/logger");
const Joi = require("joi");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./swagger");
const app = express();
const courses = require("./routes/courses");
const home = require("./routes/home");
const customers = require("./routes/customers");
const connectDB = require("./db");
const post = require("./routes/post");
const stats = require("./routes/stats");
const users = require("./routes/users");
const auth = require("./routes/auth");
const { createAllTables } = require("./components/tables");

app.set("view engine", "pug");
app.set("views", "./views");

// process.env.NODE_ENV
console.log(`NODE_ENV ${process.env.NODE_ENV}`);
console.log(`app ${app.get("env")}`);

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("public"));
app.use(helmet());
app.use("/api/courses", courses);
app.use("/", home);
app.use("/api/customers", customers);
app.use("/api/post", post);
app.use("/api/stats", stats);
app.use("/api/users", users);
app.use("/api/auth", auth);

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Blog Application API Documentation",
  })
);

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// console.log("Application Name: " + config.get("name"));
// console.log("Mail Server: " + config.get("mail.host"));
// console.log("Mail Password: " + config.get("mail.password"));

app.use(logger);

const port = process.env.PORT || 3000;

// Initialize database and start server
async function startServer() {
  try {
    // Create all tables on server startup
    await createAllTables();
    console.log("Database tables initialized successfully");

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}...`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `API Documentation available at: http://localhost:${port}/api-docs`
      );
      console.log(`Health check available at: http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
