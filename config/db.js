import mongoose from "mongoose";
import { env } from "../utils/env.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    if (conn) {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.log("error", error);
    process.exit(1);
  }
};

export default connectDB;
