import express from 'express';
import Content from '../models/Content.js';

const router = express.Router();

// Add new content
router.post('/add', async (req, res) => {
  try {
    const { title, body, tags } = req.body;
    const newContent = new Content({ title, body, tags });
    await newContent.save();
    res.status(201).json({ message: 'Content added successfully' });
  } catch (error) {
    console.error(' Error adding content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all content
router.get('/', async (req, res) => {
  try {
    const content = await Content.find().sort({ createdAt: -1 });
    res.json(content);
  } catch (error) {
    console.error(' Error retrieving content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await Content.find({ $text: { $search: query } }).limit(5);
    res.json(results);
  } catch (error) {
    console.error(' Error in search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;