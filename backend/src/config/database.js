import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("MONGODB_URI not set; continuing without a database connection.");
    return null;
  }

  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  console.log(`✅ MongoDB Connected: ${connection.connection.host}`);

  return connection;
};

export default connectDB;