const connectDB = require("../db");

// Get basic statistics
function getBasicStats(callback) {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM posts WHERE status = 'published') as published_posts,
      (SELECT COUNT(*) FROM posts WHERE status = 'draft') as draft_posts,
      (SELECT COUNT(*) FROM posts WHERE status = 'pending') as pending_posts
  `;

  connectDB.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      const stats = results[0];
      callback(null, {
        users: stats.total_users,
        posts: {
          published: stats.published_posts,
          draft: stats.draft_posts,
          pending: stats.pending_posts,
          total:
            stats.published_posts + stats.draft_posts + stats.pending_posts,
        },
      });
    }
  });
}

// Get detailed statistics
function getDetailedStats(callback) {
  const query = `
    SELECT 
      -- User statistics
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM users WHERE is_active = 1) as active_users,
      
      -- Post statistics by status
      (SELECT COUNT(*) FROM posts WHERE status = 'published') as published_posts,
      (SELECT COUNT(*) FROM posts WHERE status = 'draft') as draft_posts,
      (SELECT COUNT(*) FROM posts WHERE status = 'pending') as pending_posts,
      
      -- Recent activity
      (SELECT COUNT(*) FROM posts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as posts_last_7_days,
      (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as users_last_30_days
  `;

  connectDB.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      const stats = results[0];
      callback(null, {
        users: {
          total: stats.total_users,
          active: stats.active_users,
          new_last_30_days: stats.users_last_30_days,
        },
        posts: {
          published: stats.published_posts,
          draft: stats.draft_posts,
          pending: stats.pending_posts,
          total:
            stats.published_posts + stats.draft_posts + stats.pending_posts,
          new_last_7_days: stats.posts_last_7_days,
        },
      });
    }
  });
}

// Get posts by status with details
function getPostsByStatus(callback) {
  const query = `
    SELECT 
      status,
      COUNT(*) as count,
      MIN(created_at) as oldest_post,
      MAX(created_at) as newest_post
    FROM posts 
    GROUP BY status
    ORDER BY count DESC
  `;

  connectDB.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}

// Get user activity statistics
function getUserActivityStats(callback) {
  const query = `
    SELECT 
      role,
      COUNT(*) as count,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count
    FROM users 
    GROUP BY role
    ORDER BY count DESC
  `;

  connectDB.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}

module.exports = {
  getBasicStats,
  getDetailedStats,
  getPostsByStatus,
  getUserActivityStats,
};
