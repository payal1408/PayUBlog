const Like = require('../models/Like');
const Blog = require('../models/Blog');

/**
 * @desc    Toggle like on a blog (Like / Unlike)
 * @route   POST /api/blogs/:blogId/like
 * @access  Private
 */
const toggleLike = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const userId = req.user._id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    // Check if like already exists
    const existingLike = await Like.findOne({ blog: blogId, user: userId });

    let isLiked = false;
    if (existingLike) {
      // Remove like
      await Like.findByIdAndDelete(existingLike._id);
      isLiked = false;
    } else {
      // Create like with error catch for duplicate key safeguard
      try {
        await Like.create({ blog: blogId, user: userId });
        isLiked = true;
      } catch (err) {
        if (err.code === 11000) {
          // Duplicate key caught
          isLiked = true;
        } else {
          throw err;
        }
      }
    }

    const likesCount = await Like.countDocuments({ blog: blogId });

    res.status(200).json({
      success: true,
      message: isLiked ? 'Blog liked successfully.' : 'Blog unliked successfully.',
      data: {
        isLiked,
        likesCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get like status and total count for a blog
 * @route   GET /api/blogs/:blogId/likes
 * @access  Public (Optional Auth)
 */
const getLikes = async (req, res, next) => {
  try {
    const { blogId } = req.params;

    const likesCount = await Like.countDocuments({ blog: blogId });
    let isLiked = false;

    if (req.user) {
      const userLike = await Like.exists({ blog: blogId, user: req.user._id });
      isLiked = !!userLike;
    }

    res.status(200).json({
      success: true,
      message: 'Likes data retrieved.',
      data: {
        likesCount,
        isLiked,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleLike,
  getLikes,
};
