const mongoose = require('mongoose');

async function connectDB(uri) {
  try {
    const connection = await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
    return connection;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    throw err; // Throw error instead of exiting process for testing
  }
}

module.exports = { connectDB };
