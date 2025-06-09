import dotenv from 'dotenv'
import mongoose from "mongoose";
import colors from "colors";

dotenv.config()

export const connectDB = async () => {
  try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
          dbName: 'ToonstackAI'
      });
      console.log(`MongoDB connected: ${conn.connection.host}`.green.underline);
  } catch (error) {
      console.error('MongoDB connection error!', error);
      process.exit(1);
  }
}