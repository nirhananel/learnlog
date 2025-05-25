// Load mongoose to interact with MongoDB
const mongoose = require('mongoose');

// Load environment variables from .env file
require('dotenv').config();

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Try connecting using the connection string from .env
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,        // Use the new URL parser (recommended)
      useUnifiedTopology: true      // Use the new server discovery engine
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    // Log connection error and stop the app
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1); // Exit process with failure
  }
};

// Export the function so it can be used in other files
module.exports = connectDB;
