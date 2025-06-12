import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import {
  getContentByPlaylist,
  getContentByVideo,
  getLyricsByVideo,
  searchContent
} from '../controllers/contentController.js';

const router = express.Router();

// Get all content by playlist ID
router.get('/playlist/:playlistId', getContentByPlaylist);

// Get content by video ID
router.get('/video/:videoId', getContentByVideo);

router.get('/lyrics/:videoId', getLyricsByVideo);

// Search across video titles/descriptions
router.get('/search', searchContent);

export default router;
