import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async () => {
  try {
    const uri = env.MONGO_URI || "mongodb://127.0.0.1:27017/lingofy";
    await mongoose.connect(uri);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};