import { Schema, model } from 'mongoose';


// Define the schema for a video
export const videoSchema = new Schema({
  title: { type: String, required: true },
  videoDescription: { type: String, required: false },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  lyricsUrl: { type: String },
  clickRate: { type: Number, default: 0 },
  bounceRate: { type: Number, default: 0 }
});

// Create the Playlist model
const Video = model('Video', videoSchema);
  
export default Video;