const Blog = require('../models/Blog');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const slugify = require('../utils/slugify');
const calculateReadingTime = require('../utils/readingTime');
const { uploadImage, deleteImage } = require('../services/imageService');

/**
 * @desc    Get all blogs with filtering, searching, sorting and pagination
 * @route   GET /api/blogs
 * @access  Public (Optional auth for like status)
 */
const getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 9;
    const skip = (page - 1) * limit;

    const { search, category, tag, author, status, sort } = req.query;

    // Base query filter: default to published unless specified by author
    let query = { status: 'published' };

    // If author status query is passed and user is authenticated
    if (status && (status === 'draft' || status === 'all') && req.user) {
      if (status === 'draft') {
        query.status = 'draft';
        query.author = req.user._id;
      } else if (status === 'all') {
        delete query.status;
        query.author = req.user._id;
      }
    }

    // Category filter
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Tag filter
    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }

    // Filter by author username
    if (author) {
      const authorUser = await User.findOne({ username: author.toLowerCase() });
      if (authorUser) {
        query.author = authorUser._id;
      } else {
        return res.status(200).json({
          success: true,
          message: 'Blogs retrieved.',
          data: {
            blogs: [],
            pagination: { total: 0, page, pages: 0, limit },
          },
        });
      }
    }

    // Search query (text or regex on title, description, category, tags)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: Latest
    if (sort === 'popular' || sort === 'views') {
      sortOption = { views: -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .populate('author', 'name username profileImage bio')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    // Map like counts and comment counts for each blog card
    const blogIds = blogs.map((b) => b._id);
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

    // Check which blogs are liked by the current authenticated user (req.user)
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
      message: 'Blogs retrieved successfully.',
      data: {
        blogs: enrichedBlogs,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit) || 1,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single blog by slug
 * @route   GET /api/blogs/:slug
 * @access  Public (Optional auth for like status)
 */
const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug }).populate(
      'author',
      'name username profileImage bio socialLinks'
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    // Check if blog is draft and current user is not author
    if (blog.status === 'draft') {
      if (!req.user || req.user._id.toString() !== blog.author._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'This blog is a draft and can only be viewed by its author.',
        });
      }
    }

    // Increment view count asynchronously
    blog.views += 1;
    await blog.save({ validateBeforeSave: false });

    // Fetch counts and user like status
    const [likesCount, commentsCount, userLiked] = await Promise.all([
      Like.countDocuments({ blog: blog._id }),
      Comment.countDocuments({ blog: blog._id }),
      req.user ? Like.exists({ blog: blog._id, user: req.user._id }) : false,
    ]);

    const blogObj = blog.toObject();
    blogObj.likesCount = likesCount;
    blogObj.commentsCount = commentsCount;
    blogObj.isLikedByCurrentUser = !!userLiked;

    res.status(200).json({
      success: true,
      message: 'Blog retrieved successfully.',
      data: blogObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new blog
 * @route   POST /api/blogs
 * @access  Private
 */
const createBlog = async (req, res, next) => {
  try {
    const { title, description, content, category, tags, status } = req.body;

    if (!title || !description || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, content, and category.',
      });
    }

    let coverImageData = null;
    if (req.file) {
      coverImageData = await uploadImage(req.file, 'covers');
    } else if (req.body.coverImageUrl) {
      coverImageData = {
        url: req.body.coverImageUrl,
        fileId: '',
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Cover image is required.',
      });
    }

    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = `post-${Date.now()}`;
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (await Blog.exists({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.map((t) => t.trim().toLowerCase());
      } else if (typeof tags === 'string') {
        processedTags = tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
      }
    }

    const readingTime = calculateReadingTime(content);

    const blog = await Blog.create({
      title,
      slug: uniqueSlug,
      description,
      content,
      coverImage: coverImageData,
      author: req.user._id,
      category: category.trim(),
      tags: processedTags,
      status: status === 'draft' ? 'draft' : 'published',
      readingTime,
      publishedAt: status === 'draft' ? null : Date.now(),
    });

    await blog.populate('author', 'name username profileImage bio');

    res.status(201).json({
      success: true,
      message: status === 'draft' ? 'Draft saved successfully.' : 'Blog published successfully.',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing blog
 * @route   PUT /api/blogs/:id
 * @access  Private (Author ONLY)
 */
const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found.',
      });
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to edit this blog post.',
      });
    }

    const { title, description, content, category, tags, status } = req.body;

    if (req.file) {
      const newCover = await uploadImage(req.file, 'covers');
      if (newCover) {
        if (blog.coverImage && blog.coverImage.fileId) {
          deleteImage(blog.coverImage.fileId);
        }
        blog.coverImage = newCover;
      }
    } else if (req.body.coverImageUrl) {
      blog.coverImage = { url: req.body.coverImageUrl, fileId: '' };
    }

    if (title && title.trim() !== blog.title) {
      blog.title = title.trim();
      let baseSlug = slugify(title);
      let uniqueSlug = baseSlug;
      let counter = 1;

      while (await Blog.exists({ slug: uniqueSlug, _id: { $ne: blog._id } })) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter += 1;
      }
      blog.slug = uniqueSlug;
    }

    if (description) blog.description = description.trim();
    if (content) {
      blog.content = content;
      blog.readingTime = calculateReadingTime(content);
    }
    if (category) blog.category = category.trim();

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        blog.tags = tags.map((t) => t.trim().toLowerCase());
      } else if (typeof tags === 'string') {
        blog.tags = tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
      }
    }

    if (status && ['draft', 'published'].includes(status)) {
      if (blog.status === 'draft' && status === 'published') {
        blog.publishedAt = Date.now();
      }
      blog.status = status;
    }

    await blog.save();
    await blog.populate('author', 'name username profileImage bio');

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully.',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a blog
 * @route   DELETE /api/blogs/:id
 * @access  Private (Author ONLY)
 */
const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found.',
      });
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this blog post.',
      });
    }

    if (blog.coverImage && blog.coverImage.fileId) {
      deleteImage(blog.coverImage.fileId);
    }

    await Promise.all([
      Comment.deleteMany({ blog: blog._id }),
      Like.deleteMany({ blog: blog._id }),
      Blog.findByIdAndDelete(blog._id),
    ]);

    res.status(200).json({
      success: true,
      message: 'Blog and all associated data deleted successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard metrics for logged in user
 * @route   GET /api/blogs/dashboard/stats
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const userBlogs = await Blog.find({ author: userId });
    const totalBlogs = userBlogs.length;
    const publishedBlogs = userBlogs.filter((b) => b.status === 'published').length;
    const draftBlogs = userBlogs.filter((b) => b.status === 'draft').length;
    const totalViews = userBlogs.reduce((sum, b) => sum + (b.views || 0), 0);

    const blogIds = userBlogs.map((b) => b._id);

    const [totalLikes, totalComments, recentBlogs] = await Promise.all([
      Like.countDocuments({ blog: { $in: blogIds } }),
      Comment.countDocuments({ blog: { $in: blogIds } }),
      Blog.find({ author: userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title slug status views createdAt updatedAt'),
    ]);

    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved successfully.',
      data: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalViews,
        totalLikes,
        totalComments,
        recentBlogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get category counts and stats from published blogs
 * @route   GET /api/blogs/categories/stats
 * @access  Public
 */
const getCategoryStats = async (req, res, next) => {
  try {
    const defaultCategories = ['Technology', 'AI', 'Web Development', 'Programming', 'Design', 'Productivity'];

    const stats = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    stats.forEach((item) => {
      if (item._id) {
        countMap[item._id.toLowerCase()] = item.count;
      }
    });

    const categoryList = defaultCategories.map((name) => ({
      name,
      count: countMap[name.toLowerCase()] || 0,
    }));

    stats.forEach((item) => {
      if (item._id) {
        const exists = categoryList.some((c) => c.name.toLowerCase() === item._id.toLowerCase());
        if (!exists) {
          categoryList.push({ name: item._id, count: item.count });
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Category stats retrieved successfully.',
      data: categoryList,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getDashboardStats,
  getCategoryStats,
};
