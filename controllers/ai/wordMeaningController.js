import Content from '../../models/Content.js';
import { queryAzureOpenAI } from '../../config/azureOpenAI.js';
import redisClient from '../../config/redisClient.js';

export const getWordMeaning = async (req, res) => {
  try {
    const { word, storyId } = req.body;

    if (!word || !storyId) {
      return res.status(400).json({ error: 'Word and Story ID are required' });
    }

    const cacheKey = `meaning:${storyId}:${word.toLowerCase()}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res.json({ word, meaning: JSON.parse(cached) });
    }

    const story = await Content.findById(storyId);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const wordsArray = story.body.split(' ');
    const index = wordsArray.findIndex((w) => w.toLowerCase().includes(word.toLowerCase()));

    if (index === -1) {
      return res.status(404).json({ error: 'Word not found in story' });
    }

    const start = Math.max(0, index - 50);
    const end = Math.min(wordsArray.length, index + 50);
    const context = wordsArray.slice(start, end).join(' ');

    const explanation = await queryAzureOpenAI(word, context);

    // Cache for 24 hours
    await redisClient.setEx(cacheKey, 86400, JSON.stringify(explanation));

    res.json({ word, meaning: explanation });
  } catch (error) {
    console.error('Error in getWordMeaning:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
