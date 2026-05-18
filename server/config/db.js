/**
 * config/db.js
 * --------------------------------------------
 * Connects the Express server to MongoDB Atlas using Mongoose.
 *
 * Why Mongoose? It gives us schemas + validation + middleware on top of
 * the raw MongoDB driver — perfect for a viva project where we want to
 * show clean code and proper data modeling.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongoose 6+ already defaults useNewUrlParser/useUnifiedTopology to true
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    // Exit the process — without a DB, the API cannot serve requests
    process.exit(1);
  }
};

module.exports = connectDB;
