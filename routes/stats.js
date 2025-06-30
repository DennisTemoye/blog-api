const express = require("express");
const router = express.Router();
const connectDB = require("../db");

/**
 * @swagger
 * components:
 *   schemas:
 *     BasicStats:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Statistics retrieved successfully"
 *         data:
 *           type: object
 *           properties:
 *             users:
 *               type: integer
 *               description: Total number of users
 *               example: 25
 *             posts:
 *               type: object
 *               properties:
 *                 published:
 *                   type: integer
 *                   description: Number of published posts
 *                   example: 15
 *                 draft:
 *                   type: integer
 *                   description: Number of draft posts
 *                   example: 8
 *                 pending:
 *                   type: integer
 *                   description: Number of pending posts
 *                   example: 2
 *                 total:
 *                   type: integer
 *                   description: Total number of posts
 *                   example: 25
 *     DetailedStats:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Detailed statistics retrieved successfully"
 *         data:
 *           type: object
 *           properties:
 *             users:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of users
 *                   example: 25
 *                 active:
 *                   type: integer
 *                   description: Number of active users
 *                   example: 20
 *             posts:
 *               type: object
 *               properties:
 *                 by_status:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         example: "published"
 *                       count:
 *                         type: integer
 *                         example: 15
 *                 recent_7_days:
 *                   type: integer
 *                   description: Number of posts created in the last 7 days
 *                   example: 5
 */

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get basic statistics
 *     description: Retrieve basic statistics about users and posts
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BasicStats'
 *             example:
 *               message: "Statistics retrieved successfully"
 *               data:
 *                 users: 25
 *                 posts:
 *                   published: 15
 *                   draft: 8
 *                   pending: 2
 *                   total: 25
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve statistics"
 */
// GET statistics
router.get("/", (req, res) => {
  const queries = {
    users: "SELECT COUNT(*) as count FROM users",
    published: "SELECT COUNT(*) as count FROM posts WHERE status = 'published'",
    draft: "SELECT COUNT(*) as count FROM posts WHERE status = 'draft'",
    pending: "SELECT COUNT(*) as count FROM posts WHERE status = 'pending'",
  };

  const stats = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;

  // Execute all queries
  Object.keys(queries).forEach((key) => {
    connectDB.query(queries[key], (err, results) => {
      if (err) {
        console.error(`Error getting ${key} count:`, err);
        stats[key] = 0;
      } else {
        stats[key] = results[0].count;
      }

      completedQueries++;

      // When all queries are done, send the response
      if (completedQueries === totalQueries) {
        res.json({
          message: "Statistics retrieved successfully",
          data: {
            users: stats.users,
            posts: {
              published: stats.published,
              draft: stats.draft,
              pending: stats.pending,
              total: stats.published + stats.draft + stats.pending,
            },
          },
        });
      }
    });
  });
});

/**
 * @swagger
 * /api/stats/detailed:
 *   get:
 *     summary: Get detailed statistics
 *     description: Retrieve detailed statistics including user activity and post breakdowns
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Detailed statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetailedStats'
 *             example:
 *               message: "Detailed statistics retrieved successfully"
 *               data:
 *                 users:
 *                   total: 25
 *                   active: 20
 *                 posts:
 *                   by_status:
 *                     - status: "published"
 *                       count: 15
 *                     - status: "draft"
 *                       count: 8
 *                     - status: "pending"
 *                       count: 2
 *                   recent_7_days: 5
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve detailed statistics"
 */
// GET detailed statistics with more information
router.get("/detailed", (req, res) => {
  const detailedQueries = {
    users: "SELECT COUNT(*) as total_users FROM users",
    posts_by_status: `
      SELECT 
        status,
        COUNT(*) as count
      FROM posts 
      GROUP BY status
    `,
    recent_posts: `
      SELECT 
        COUNT(*) as count 
      FROM posts 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `,
    active_users: `
      SELECT 
        COUNT(*) as count 
      FROM users 
      WHERE is_active = 1
    `,
  };

  const detailedStats = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(detailedQueries).length;

  // Execute detailed queries
  Object.keys(detailedQueries).forEach((key) => {
    connectDB.query(detailedQueries[key], (err, results) => {
      if (err) {
        console.error(`Error getting ${key}:`, err);
        detailedStats[key] = key === "posts_by_status" ? [] : 0;
      } else {
        detailedStats[key] = results;
      }

      completedQueries++;

      // When all queries are done, send the response
      if (completedQueries === totalQueries) {
        res.json({
          message: "Detailed statistics retrieved successfully",
          data: {
            users: {
              total: detailedStats.users[0]?.total_users || 0,
              active: detailedStats.active_users[0]?.count || 0,
            },
            posts: {
              by_status: detailedStats.posts_by_status,
              recent_7_days: detailedStats.recent_posts[0]?.count || 0,
            },
          },
        });
      }
    });
  });
});

module.exports = router;
