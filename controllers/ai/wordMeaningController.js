import Playlist from '../../models/Playlist.js';
import Video from '../../models/Video.js';
import { queryAzureOpenAI } from '../../config/azureOpenAI.js';
import redisClient from '../../config/redisClient.js';
import axios from 'axios';

const cleanSRT = (srtText) => {
  return srtText
    .split('\n')
    .filter(line =>
      line &&
      !line.match(/^\d+$/) &&
      !line.includes('-->') &&
      !line.toLowerCase().includes('[music]')
    )
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const getWordMeaning = async (req, res) => {
  try {
    const { word, playlistId, videoId } = req.body;

    if (!word || !playlistId || !videoId) {
      return res.status(400).json({ error: 'Word, Playlist ID, and Video ID are required' });
    }

    const meaningCacheKey = `meaning:${playlistId}:${videoId}:${word.toLowerCase()}`;
    const lyricsCacheKey = `lyrics:${videoId}`;

    // Check if word meaning is cached
    const cachedMeaning = await redisClient.get(meaningCacheKey);
    if (cachedMeaning) {
      return res.json({ word, meaning: JSON.parse(cachedMeaning) });
    }

    // Check if cleaned lyrics are cached
    let cleanedLyrics = await redisClient.get(lyricsCacheKey);

    if (!cleanedLyrics) {
      const video = await Video.findById(videoId);
      if (!video || !video.lyricsUrl) {
        return res.status(404).json({ error: 'Video or lyrics not found' });
      }

      try {
        const response = await axios.get(video.lyricsUrl);
        cleanedLyrics = cleanSRT(response.data);
        await redisClient.setEx(lyricsCacheKey, 86400, cleanedLyrics); // Cache cleaned lyrics
      } catch (err) {
        console.error('Failed to fetch lyrics from Azure Blob:', err);
        return res.status(500).json({ error: 'Unable to fetch lyrics content' });
      }
    }

    const wordsArray = cleanedLyrics.split(/\s+/);
    const index = wordsArray.findIndex((w) =>
      w.toLowerCase().includes(word.toLowerCase())
    );

    if (index === -1) {
      return res.status(404).json({ error: 'Word not found in lyrics' });
    }

    const context = wordsArray.slice(Math.max(0, index - 50), index + 50).join(' ');
    const explanation = await queryAzureOpenAI(word, context);

    await redisClient.setEx(meaningCacheKey, 86400, JSON.stringify(explanation));

    res.json({ word, meaning: explanation });
  } catch (error) {
    console.error('Error in getWordMeaning:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
