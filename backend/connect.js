import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    console.log("MongoDB URI:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
    });
    console.log("MongoDB connection SUCCESS");
  } catch (error) {
    console.error("MongoDB connection FAIL", error);
    process.exit(1);
  }
};

export default connectDB;
