import express from 'express';
import dotenv from 'dotenv'
import Content from '../models/Content.js';
import { queryAzureOpenAI } from '../config/azureOpenAI.js';

dotenv.config()

const router = express.Router();

router.post('/word-meaning', async (req, res) => {
  try {
    const { word, storyId } = req.body;

    if (!word || !storyId) {
      return res.status(400).json({ error: 'Word and Story ID are required' });
    }

    // Fetch the story from the database
    const story = await Content.findById(storyId);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Extract surrounding context (50 words before & after the word)
    const wordsArray = story.body.split(' ');
    const index = wordsArray.findIndex((w) => w.toLowerCase().includes(word.toLowerCase()));

    if (index === -1) {
      return res.status(404).json({ error: 'Word not found in story' });
    }

    // Get a small portion of text around the word
    const start = Math.max(0, index - 50);
    const end = Math.min(wordsArray.length, index + 50);
    const context = wordsArray.slice(start, end).join(' ');

    // Get AI explanation
    const explanation = await queryAzureOpenAI(word, context);

    res.json({ word, meaning: explanation });
  } catch (error) {
    console.error('Error in /word-meaning:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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

router.get("/:id", async (req, res) => {
  try {
      const content = await Content.findById(req.params.id);
      if (!content) {
          return res.status(404).json({ message: "Content not found" });
      }
      res.json(content);
  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
  }
});


export default router;