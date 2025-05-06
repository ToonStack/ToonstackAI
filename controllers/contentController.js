import Content from '../models/Content.js';
import { queryAzureOpenAI } from '../config/azureOpenAI.js';

export const addContent = async (req, res) => {
  try {
    const { title, body, tags } = req.body;
    const newContent = new Content({ title, body, tags });
    await newContent.save();
    res.status(201).json({ message: 'Content added successfully' });
  } catch (error) {
    console.error('Error adding content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllContent = async (req, res) => {
  try {
    const content = await Content.find().sort({ createdAt: -1 });
    res.json(content);
  } catch (error) {
    console.error('Error retrieving content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const searchContent = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await Content.find({ $text: { $search: query } }).limit(5);
    res.json(results);
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};