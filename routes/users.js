const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const {
  selectAll,
  select,
  insert,
  update,
  remove,
} = require("../components/query");
const { validateUser } = require("../components/validation");
const table = "users";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - username
 *         - email
 *         - role
 *         - is_active
 *       properties:
 *         id:
 *           type: integer
 *           description: The user ID
 *           example: 1
 *         username:
 *           type: string
 *           description: The username
 *           example: "john_doe"
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *           example: "john@example.com"
 *         first_name:
 *           type: string
 *           description: The user's first name
 *           example: "John"
 *         last_name:
 *           type: string
 *           description: The user's last name
 *           example: "Doe"
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: The user's role
 *           example: "user"
 *         is_active:
 *           type: boolean
 *           description: Whether the user account is active
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the user was created
 *           example: "2024-01-01T00:00:00.000Z"
 *     UserInput:
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
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: The user's role
 *           example: "user"
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
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve all users
 *     description: Get a list of all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// GET /api/users - Get all users (admin only)
router.get("/", async (req, res) => {
  try {
    selectAll(table, res);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     description: Get a specific user by their ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: User found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// GET /api/users/:id - Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    select(table, id, res);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Register a new user account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *           example:
 *             username: "john_doe"
 *             email: "john@example.com"
 *             password: "securepassword123"
 *             first_name: "John"
 *             last_name: "Doe"
 *             role: "user"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 *       500:
 *         description: Server error
 */
// POST /api/users - Create new user (register)
router.post("/", async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role } = req.body;

    // Validate input
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Prepare user data
    const userData = {
      username,
      email,
      password_hash,
      first_name: first_name || null,
      last_name: last_name || null,
      role: role || "user",
      is_active: true,
    };

    insert(table, userData, res);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// PUT /api/users/:id - Update user
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, first_name, last_name, role, is_active } =
      req.body;

    // Validate input (excluding password for updates)
    const updateData = {
      username,
      email,
      first_name,
      last_name,
      role,
      is_active,
    };
    const { error } = validateUser(updateData, true); // true for update mode
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    update(table, id, cleanData, res);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// PUT /api/users/:id/password - Update user password
router.put("/:id/password", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters long" });
    }

    // Get current user
    const mysql = require("../db");
    mysql.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [id],
      async (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(
          currentPassword,
          results[0].password_hash
        );
        if (!isValidPassword) {
          return res
            .status(401)
            .json({ error: "Current password is incorrect" });
        }

        // Hash new password
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        update(table, id, { password_hash: newPasswordHash }, res);
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to update password" });
  }
});

// DELETE /api/users/:id - Delete user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    remove(table, id, res);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
