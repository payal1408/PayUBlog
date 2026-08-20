const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index prevents duplicate likes at database level
likeSchema.index({ blog: 1, user: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);
module.exports = Like;
