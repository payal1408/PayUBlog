const jwt = require('jsonwebtoken');

/**
 * Generates signed JWT authentication token
 * @param {string} id User ID
 * @returns {string} Signed JWT
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'fallback_jwt_secret_development_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
