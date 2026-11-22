const mongoose = require('mongoose');

let connectionPromise = null;

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || process.env.DB_String;
  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI. Copy backend/.env.example to backend/.env and add your MongoDB connection string.');
  }
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 })
      .then(() => {
        console.log(`MongoDB connected: ${mongoose.connection.name}`);
        return mongoose.connection;
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }
  return connectionPromise;
}

module.exports = connectDB;