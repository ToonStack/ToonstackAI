import Playlist from '../models/Playlist.js';
import Video from '../models/Video.js';
import axios from 'axios';

/**
 * Clean SRT subtitle content into plain text
 */
const cleanSRT = (srtText) => {
  return srtText
    .split('\n')
    .filter(line => (
      line &&                          // not empty
      !line.match(/^\d+$/) &&          // not just a number
      !line.includes('-->') &&         // not a timestamp
      !line.toLowerCase().includes('[music]') // optionally strip tags like [Music]
    ))
    .join(' ')
    .replace(/\s+/g, ' ')              // collapse multiple spaces
    .trim();
};

/**
 * Get all content based on playlist
 * Returns: playlist info with populated video data (incl. lyricsUrl, etc.)
 */
export const getContentByPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId).populate('videos');
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json({
      playlistId: playlist._id,
      name: playlist.name,
      videos: playlist.videos.map(video => ({
        videoId: video._id,
        title: video.title,
        lyricsUrl: video.lyricsUrl,
        videoDescription: video.videoDescription
      }))
    });
  } catch (error) {
    console.error('Error retrieving playlist content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Get single content by video ID
 */
export const getContentByVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({
      videoId: video._id,
      title: video.title,
      lyricsUrl: video.lyricsUrl,
      videoDescription: video.videoDescription
    });
  } catch (error) {
    console.error('Error retrieving video content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Search content by video title or description
 */
export const searchContent = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await Video.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { videoDescription: { $regex: query, $options: 'i' } }
      ]
    }).limit(5);

    res.json(results);
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Get video content by ID, including lyrics text
 */
export const getLyricsByVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    let lyricsText = '';
    if (video.lyricsUrl) {
      try {
        const response = await axios.get(video.lyricsUrl);
        lyricsText = cleanSRT(response.data);
      } catch (err) {
        console.error('Error fetching lyrics from Azure Blob:', err.message);
        lyricsText = 'Failed to fetch lyrics';
      }
    }

    res.json({
      videoId: video._id,
      title: video.title,
      lyrics: lyricsText,
      videoDescription: video.videoDescription,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl
    });
  } catch (error) {
    console.error('Error retrieving video content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};