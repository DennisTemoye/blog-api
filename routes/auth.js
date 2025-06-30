const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/auth");
const { select } = require("../components/query");

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           description: The user's password
 *           example: "securepassword123"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Login successful"
 *         user:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 *           description: JWT token for authentication
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     RegisterInput:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The username
 *           example: "john_doe"
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           description: The user's password
 *           example: "securepassword123"
 *         first_name:
 *           type: string
 *           description: The user's first name
 *           example: "John"
 *         last_name:
 *           type: string
 *           description: The user's last name
 *           example: "Doe"
 *     LogoutResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Logout successful"
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: User registration
 *     description: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *           example:
 *             username: "john_doe"
 *             email: "john@example.com"
 *             password: "securepassword123"
 *             first_name: "John"
 *             last_name: "Doe"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Username is required"
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User with this email already exists"
 *       500:
 *         description: Server error
 */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Username, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const mysql = require("../db");
    mysql.query(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username],
      async (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        if (results.length > 0) {
          return res.status(409).json({
            error: "User with this email or username already exists",
          });
        }

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Create user
        const userData = {
          username,
          email,
          password_hash,
          first_name: first_name || null,
          last_name: last_name || null,
          role: "user",
          is_active: true,
        };

        mysql.query("INSERT INTO users SET ?", userData, (err, result) => {
          if (err) {
            return res.status(500).json({ error: "Failed to create user" });
          }

          // Remove password from response
          const { password_hash, ...userWithoutPassword } = userData;
          userWithoutPassword.id = result.insertId;

          res.status(201).json({
            message: "User registered successfully",
            user: userWithoutPassword,
          });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user and return user information
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *           example:
 *             email: "john@example.com"
 *             password: "securepassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email and password are required"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid email or password"
 *       500:
 *         description: Server error
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate login input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const mysql = require("../db");
    mysql.query(
      "SELECT * FROM users WHERE email = ? AND is_active = 1",
      [email],
      async (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(
          password,
          user.password_hash
        );
        if (!isValidPassword) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        // Remove password from response
        const { password_hash, ...userWithoutPassword } = user;
        console.log("user", user);
        console.log("userWithoutPassword", userWithoutPassword);
        console.log("zzzz", process.env.JWT_SECRET);
        const accessToken = jwt.sign(
          { id: userWithoutPassword.id },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        console.log("accessToken", accessToken);
        res.json({
          message: "Login successful",
          user: userWithoutPassword,
          accessToken: accessToken,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logout the current user (client-side token removal)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoutResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/logout", (req, res) => {
  // In a real application, you might want to:
  // 1. Add the token to a blacklist
  // 2. Clear server-side sessions
  // 3. Update user's last logout time

  res.json({
    message: "Logout successful",
  });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Get information about the currently authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No token provided"
 *       500:
 *         description: Server error
 */
router.get("/me", authenticateToken, (req, res) => {
  select("users", req.user.id, res);
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using a refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: The refresh token
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token refreshed successfully"
 *                 access_token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refresh_token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */
router.post("/refresh", (req, res) => {
  // In a real application, you would:
  // 1. Verify the refresh token
  // 2. Generate a new access token
  // 3. Optionally generate a new refresh token

  res.status(501).json({
    error: "Not implemented - requires JWT middleware",
  });
});

module.exports = router;
