const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [150, 'Blog title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Blog description is required'],
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    coverImage: {
      url: {
        type: String,
        required: [true, 'Cover image is required'],
      },
      fileId: {
        type: String,
        default: '',
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    readingTime: {
      type: Number,
      default: 1,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for full-text search capabilities
blogSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  tags: 'text',
});

// Compound indexes for optimal sorting and filtering performance
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ status: 1, category: 1, createdAt: -1 });
blogSchema.index({ author: 1, status: 1 });

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;
