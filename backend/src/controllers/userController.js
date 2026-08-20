const User = require('../models/User');
const Blog = require('../models/Blog');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const { uploadImage, deleteImage } = require('../services/imageService');

/**
 * @desc    Get public author profile by username
 * @route   GET /api/users/author/:username
 * @access  Public
 */
const getAuthorProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    const author = await User.findOne({ username: username.toLowerCase() }).select(
      'name username profileImage bio socialLinks createdAt'
    );

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author profile not found.',
      });
    }

    // Get published blogs by author
    const blogs = await Blog.find({ author: author._id, status: 'published' })
      .sort({ publishedAt: -1 });

    const blogIds = blogs.map((b) => b._id);
    const totalLikes = await Like.countDocuments({ blog: { $in: blogIds } });

    // Aggregate likes and comments per blog
    const [likeCounts, commentCounts] = await Promise.all([
      Like.aggregate([
        { $match: { blog: { $in: blogIds } } },
        { $group: { _id: '$blog', count: { $sum: 1 } } },
      ]),
      Comment.aggregate([
        { $match: { blog: { $in: blogIds } } },
        { $group: { _id: '$blog', count: { $sum: 1 } } },
      ]),
    ]);

    const likeMap = {};
    likeCounts.forEach((item) => {
      likeMap[item._id.toString()] = item.count;
    });

    const commentMap = {};
    commentCounts.forEach((item) => {
      commentMap[item._id.toString()] = item.count;
    });

    let userLikedSet = new Set();
    if (req.user && blogIds.length > 0) {
      const userLikes = await Like.find({ user: req.user._id, blog: { $in: blogIds } }).select('blog');
      userLikedSet = new Set(userLikes.map((l) => l.blog.toString()));
    }

    const enrichedBlogs = blogs.map((blog) => {
      const bObj = blog.toObject();
      bObj.likesCount = likeMap[blog._id.toString()] || 0;
      bObj.commentsCount = commentMap[blog._id.toString()] || 0;
      bObj.isLikedByCurrentUser = userLikedSet.has(blog._id.toString());
      return bObj;
    });

    res.status(200).json({
      success: true,
      message: 'Author profile retrieved.',
      data: {
        author,
        totalBlogs: blogs.length,
        totalLikes,
        blogs: enrichedBlogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update authenticated user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    const { name, bio, socialLinks } = req.body;

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();

    if (socialLinks) {
      try {
        const parsedSocial = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
        user.socialLinks = {
          twitter: parsedSocial.twitter || user.socialLinks.twitter || '',
          github: parsedSocial.github || user.socialLinks.github || '',
          linkedin: parsedSocial.linkedin || user.socialLinks.linkedin || '',
          website: parsedSocial.website || user.socialLinks.website || '',
        };
      } catch (e) {
        // Keep current social links on parse error
      }
    }

    if (req.file) {
      const newAvatar = await uploadImage(req.file, 'avatars');
      if (newAvatar) {
        if (user.profileImage && user.profileImage.fileId) {
          deleteImage(user.profileImage.fileId);
        }
        user.profileImage = newAvatar;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          bio: user.bio,
          socialLinks: user.socialLinks,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password for authenticated user
 * @route   PUT /api/users/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password provided is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuthorProfile,
  updateProfile,
  changePassword,
};
