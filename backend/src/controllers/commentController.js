const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

/**
 * @desc    Get comments for a blog
 * @route   GET /api/blogs/:blogId/comments
 * @access  Public
 */
const getComments = async (req, res, next) => {
  try {
    const { blogId } = req.params;

    const comments = await Comment.find({ blog: blogId })
      .populate('user', 'name username profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully.',
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a comment to a blog
 * @route   POST /api/blogs/:blogId/comments
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty.',
      });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    const comment = await Comment.create({
      blog: blog._id,
      user: req.user._id,
      content: content.trim(),
    });

    await comment.populate('user', 'name username profileImage');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comments/:id
 * @access  Private (Comment Author OR Blog Author)
 */
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    const blog = await Blog.findById(comment.blog);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Associated blog post not found.',
      });
    }

    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isBlogAuthor = blog.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // STRICT AUTHORIZATION CHECK
    if (!isCommentAuthor && !isBlogAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this comment.',
      });
    }

    await Comment.findByIdAndDelete(comment._id);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComments,
  addComment,
  deleteComment,
};
