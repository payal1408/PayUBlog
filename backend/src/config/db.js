const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/enterprise_blog';
    const conn = await mongoose.connect(mongoUri, {
      // Modern mongoose options are set by default in v6/v7/v8
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    console.warn(`[Database Warning] Operating in disconnected fallback mode or retrying...`);
  }
};

module.exports = connectDB;
