/**
 * Not Found Middleware (404)
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Centralized Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Handle Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Handle Multer upload errors (file too large, invalid type)
  if (err.name === 'MulterError' || (err.message || '').startsWith('Invalid file format')) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') message = 'Image must be 5MB or smaller.';
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
