const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getComments,
  addComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Matches /api/blogs/:blogId/comments
router
  .route('/')
  .get(getComments)
  .post(protect, addComment);

// Matches /api/comments/:id
router.delete('/:id', protect, deleteComment);

module.exports = router;
