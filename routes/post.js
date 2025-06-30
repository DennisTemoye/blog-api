const express = require("express");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
const {
  selectAll,
  select,
  insert,
  update,
  remove,
} = require("../components/query");
const { validatePost } = require("../components/validation");

const table = "posts";

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - content
 *         - author
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: The post ID
 *           example: 1
 *         title:
 *           type: string
 *           description: The post title
 *           example: "Getting Started with Express.js"
 *         content:
 *           type: string
 *           description: The post content
 *           example: "Express.js is a minimal and flexible Node.js web application framework..."
 *         author:
 *           type: string
 *           description: The author of the post
 *           example: "john_doe"
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           description: The post status
 *           example: "published"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the post was created
 *           example: "2024-01-01T00:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the post was last updated
 *           example: "2024-01-01T00:00:00.000Z"
 *     PostInput:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - author
 *       properties:
 *         title:
 *           type: string
 *           description: The post title
 *           example: "Getting Started with Express.js"
 *         content:
 *           type: string
 *           description: The post content
 *           example: "Express.js is a minimal and flexible Node.js web application framework..."
 *         author:
 *           type: string
 *           description: The author of the post
 *           example: "john_doe"
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           description: The post status
 *           example: "draft"
 */

/**
 * @swagger
 * /api/post:
 *   get:
 *     summary: Retrieve all posts
 *     description: Get a list of all blog posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Filter posts by status
 *         example: "published"
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter posts by author
 *         example: "john_doe"
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *             example:
 *               - id: 1
 *                 title: "Getting Started with Express.js"
 *                 content: "Express.js is a minimal and flexible Node.js web application framework..."
 *                 author: "john_doe"
 *                 status: "published"
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *       500:
 *         description: Server error
 */
// GET all posts
router.get("/", authenticateToken, (req, res) => {
  selectAll(table, res);
});

/**
 * @swagger
 * /api/post/{id}:
 *   get:
 *     summary: Retrieve a post by ID
 *     description: Get a specific blog post by its ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Post found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *             example:
 *               id: 1
 *               title: "Getting Started with Express.js"
 *               content: "Express.js is a minimal and flexible Node.js web application framework..."
 *               author: "john_doe"
 *               status: "published"
 *               created_at: "2024-01-01T00:00:00.000Z"
 *               updated_at: "2024-01-01T00:00:00.000Z"
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
// GET post by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  select(table, id, res);
});

/**
 * @swagger
 * /api/post:
 *   post:
 *     summary: Create a new post
 *     description: Create a new blog post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostInput'
 *           example:
 *             title: "New Blog Post"
 *             content: "This is the content of my new blog post..."
 *             author: "john_doe"
 *             status: "draft"
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *             example:
 *               id: 2
 *               title: "New Blog Post"
 *               content: "This is the content of my new blog post..."
 *               author: "john_doe"
 *               status: "draft"
 *               created_at: "2024-01-01T00:00:00.000Z"
 *               updated_at: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Title is required"
 *       500:
 *         description: Server error
 */
// POST create new post
router.post("/", (req, res) => {
  const { title, content, author, status } = req.body;

  // Validate the request body
  const { error } = validatePost(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Insert the post - the insert function will handle the response
  insert(table, { title, content, author, status }, res);
});

/**
 * @swagger
 * /api/post/{id}:
 *   put:
 *     summary: Update a post
 *     description: Update an existing blog post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostInput'
 *           example:
 *             title: "Updated Blog Post Title"
 *             content: "This is the updated content of my blog post..."
 *             author: "john_doe"
 *             status: "published"
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *             example:
 *               id: 1
 *               title: "Updated Blog Post Title"
 *               content: "This is the updated content of my blog post..."
 *               author: "john_doe"
 *               status: "published"
 *               created_at: "2024-01-01T00:00:00.000Z"
 *               updated_at: "2024-01-02T00:00:00.000Z"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Title is required"
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
// PUT update post
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, content, author, status } = req.body;

  // Validate the request body
  const { error } = validatePost(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Update the post
  update(table, id, { title, content, author, status }, res);
});

/**
 * @swagger
 * /api/post/{id}:
 *   delete:
 *     summary: Delete a post
 *     description: Delete a blog post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *             example:
 *               id: 1
 *               title: "Deleted Post"
 *               content: "This post has been deleted..."
 *               author: "john_doe"
 *               status: "archived"
 *               created_at: "2024-01-01T00:00:00.000Z"
 *               updated_at: "2024-01-01T00:00:00.000Z"
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
// DELETE post
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  remove(table, id, res);
});

module.exports = router;
