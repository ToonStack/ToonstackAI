import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  title: String,
  body: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

// Enable Full-Text Search
contentSchema.index({ title: 'text', body: 'text' });

export default mongoose.model('Content', contentSchema);
