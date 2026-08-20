const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const seedDatabase = require('./utils/seedData');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`[PayUBlog API] Server running on http://localhost:${PORT}`);
    });

    process.on('unhandledRejection', (err) => {
      console.error(`[Server Error] ${err.message}`);
    });
  } catch (error) {
    console.error(`[Startup Failure] ${error.message}`);
    process.exit(1);
  }
};

startServer();
