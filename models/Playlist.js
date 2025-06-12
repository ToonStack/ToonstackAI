import { Schema, model } from 'mongoose';

const playlistSchema = new Schema({
  creatorId: { type: Schema.Types.ObjectId, ref: 'Creator', required: true },
  name: { type: String, required: true },
  playlistDescription: { type: String },
  thumbnailUrl: { type: String },
  videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  tags: { type: String },
  age: { type: String },
  category: { type: String },
  noOfParts: { type: Number },
  views: { type: Number, default: 0 },
  clickRate: { type: Number, default: 0 },
  shouldPublish: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  isPendingApproval: { type: Boolean, default: true },
  ratings: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String }
  }],
  createdAt: { type: Date, default: Date.now },
  isFree: { type: Boolean, default: false },
  color: { type: String, required: true }
});

const Playlist = model('Playlist', playlistSchema);
export default Playlist;