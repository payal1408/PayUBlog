const express = require('express');
const router = express.Router({ mergeParams: true });
const { toggleLike, getLikes } = require('../controllers/likeController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// Matches /api/blogs/:blogId/likes and /api/blogs/:blogId/like
router.get('/', optionalProtect, getLikes);
router.post('/', protect, toggleLike);

module.exports = router;
