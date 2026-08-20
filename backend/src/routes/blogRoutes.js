const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getDashboardStats,
  getCategoryStats,
} = require('../controllers/blogController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const commentRoutes = require('./commentRoutes');
const likeRoutes = require('./likeRoutes');

// Mount Sub-routers for Comments & Likes BEFORE /:id parameter matching
router.use('/:blogId/comments', commentRoutes);
router.use('/:blogId/like', likeRoutes);
router.use('/:blogId/likes', likeRoutes);

// Category stats route (MUST come before /:id or /slug/:slug)
router.get('/categories/stats', getCategoryStats);

// Dashboard stats route (MUST come before /:id or /slug/:slug)
router.get('/dashboard/stats', protect, getDashboardStats);

router
  .route('/')
  .get(optionalProtect, getBlogs)
  .post(protect, upload.single('coverImage'), createBlog);

router.get('/slug/:slug', optionalProtect, getBlogBySlug);

router
  .route('/:id')
  .put(protect, upload.single('coverImage'), updateBlog)
  .delete(protect, deleteBlog);

module.exports = router;
