<<<<<<< HEAD
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  console.log(`MongoDB Atlas connected: ${conn.connection.host}`);

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  return conn;
};

module.exports = connectDB;
=======
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Mongo URI:", process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("Full Error:");
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
>>>>>>> 0aa1a72595887b158bf369f4d99479c03f0a5902
>>>>>>> 0aa1a72595887b158bf369f4d99479c03f0a5902
