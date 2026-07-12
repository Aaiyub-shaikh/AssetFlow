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