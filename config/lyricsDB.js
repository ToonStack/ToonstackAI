import dotenv from 'dotenv'
import mongoose from "mongoose";
import colors from "colors";

dotenv.config()

export const connectLyricsDB = async () => {
  try {
      const conn = await mongoose.connect(process.env.LYRICS_MONGO_URI, {
          dbName: 'Toonstack'
      });
      console.log(`MongoDB connected: ${conn.connection.host}`.green.underline);
  } catch (error) {
      console.error('MongoDB connection error!', error);
      process.exit(1);
  }
}